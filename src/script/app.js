(function() {
    window.addEventListener('load', init);

    var gradebookFile = null,
        externalFiles = [];
    /**
     * Starts the application
     */
    function init() {

        new Uploader({
            container: "#gradebook",
            title: 'Gradebook',
            types: ['text/csv'],
            transform: function(data) {
                new Gradebook(data); // hack to throw error if gradebook is invalid
                return data;
            },
            onUpload: function(result) {
                gradebookFile = result;
                handle();
            }
        });

        new Uploader({
            container: "#external",
            multiple: true,
            title: 'Grades',
            types: ['text/csv'],
            onUpload: function(results) {
                externalFiles = results;
                handle();
            }
        });

        handle();

        /**
         * The function to actually try and merge the gradebook with the files
         */
        function handle() {
            var link = document.querySelector('#download'),
                ready = true,
                item = null;


            // check gradebook file
            item = document.querySelector('#checkGrade');
            if (!gradebookFile || gradebookFile.error) {
                ready = false;
                item.classList.remove('ready');
            } else {
                item.classList.add('ready');
            }

            // check merge files
            item = document.querySelector('#checkScore');
            if (!externalFiles.length || !_.every(externalFiles, function(file) { return !file.error; })) {
                ready = false;
                item.classList.remove('ready');
            } else {
                item.classList.add('ready');
            }


            // don't merge if not ready
            item = document.querySelector('#checkDownload');
            if (!ready) {
                item.classList.remove('ready');
                link.removeAttribute('download');
                link.removeAttribute('href');
                return;
            }

            // merge each file in order
            var files = _.map(externalFiles, function(file) { return file.data; });
            var gradebook = new Gradebook(gradebookFile.data);
            _.each(files, gradebook.merge, gradebook);

            // make downloadable
            var blob = new Blob([
                Papa.unparse(gradebook.format())
            ]);
            item.classList.add('ready');
            link.setAttribute('download', gradebook.name + '.csv');
            link.setAttribute('href', URL.createObjectURL(blob));
        }
    }

})();
