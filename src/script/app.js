(function() {
    window.addEventListener('load', init);

    var gradebookFile = null,
        externalFiles = [];

    /**
     * Starts the application
     */
    function init() {
        var gradebook = null,
            files = [];

        new Uploader({
            container: "#gradebook",
            title: 'Gradebook',
            onUpload: function(result) {
                gradebook = new Gradebook(result.data);
                handle();
            }
        });

        new Uploader({
            container: "#external",
            multiple: true,
            title: 'Grades',
            onUpload: function(results) {
                files = _.map(results, function(result) { return result.data; });
                handle();
            }
        });

        /**
         * The function to actually try and merge the gradebook with the files
         */
        function handle() {
            if (!gradebook || !files.length) {
                console.log('missing essential file(s)');
                return;
            }

            // merge each file in order
            _.each(files, gradebook.merge, gradebook);

            var blob = new Blob([
                Papa.unparse(gradebook.format())
            ]);

            var link = document.createElement('a');
            link.setAttribute('download', gradebook.name + '.csv');
            link.setAttribute('href', URL.createObjectURL(blob));
            link.text = "Download!";

            document.querySelector("#output").appendChild(link);
        }

        handle();
    }

})();
