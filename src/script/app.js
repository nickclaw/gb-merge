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
            onUpload: function(result) {
                gradebook = new Gradebook(result.data);
                handle();
            }
        });

        new Uploader({
            container: "#external",
            multiple: true,
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

            console.log(gradebook.format());
        }

        handle();
    }

})();
