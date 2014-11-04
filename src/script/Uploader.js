(function() {

    window.Uploader = Uploader;

    var DEFAULT_OPTIONS = {
        container: null,
        multiple: false,
        onUpload: noop,
        types: [],
        maxSize: 0
    };

    function Uploader(options) {

        // fill options
        this.options = options = _.extend({}, DEFAULT_OPTIONS, options);
        if (!options.container) throw new Error("options.container must be set.");

        var container = options.container;

        // save/create important elements
        this.container = _.isString(container) ? document.querySelector(container) : container;
        this.parsedFiles = [];

        this._createElements();
        this._addListeners();
    }



    //
    // Prototype
    //

    _.extend(Uploader.prototype, {

        /**
         * Makes sure a file is valid to be parsed
         * @param {File} file
         * @return {String|null}
         */
        validate: function(file) {
            // if invalid type
            if (this.options.types.length && !_.contains(this.options.types, file.type)) {
                return "Files of type " + file.type + " not supported.";
            }

            if (this.options.maxSize && file.size > this.options.maxSize) {
                return "File too big.";
            }

            return null;
        },

        /**
         * Parses a bunch of files
         * @param {Array.<File>} files
         * @param {Function} callback
         */
        parse: function(files, callback) {

            // will call the callback after called
            // for each file
            var done = _.after(files.length + 1, callback);

            // lazily map files by returning an empty
            // object and filling it later, wait until
            // all files have been parsed asynchronously
            // and there respective objects filled with data
            // before calling the callback
            var parsedFiles = _.map(files, function(file) {
                var data = {
                    file: file,
                    data: undefined,
                    error: undefined
                };


                // if the file is the wrong type
                // or is too big, don't bother
                // parsing
                var error = this.validate(file);
                if (error) {
                    data.error = error;
                    _.defer(function() {
                        done(parsedFiles);
                    });
                    return data;
                }

                // try to parse the file
                // only keep the first error
                Papa.parse(file, {
                    complete: function(results) {

                        if (results.errors.length) {
                            data.error = results.errors[0].message;
                        } else {
                            data.data = results.data;
                        }

                        done(parsedFiles);
                    }
                });

                return data;
            }, this);

            // if there are no files at all
            // this will make the callback call
            done([]);
        },

        /**
         * Creates the uploader dom
         * @private
         */
        _createElements: function() {
            var container = this.container;

            container.classList.add('uploader');

            container.innerHTML = a = _.template(document.querySelector("#uploader").textContent, {
                title: this.options.title,
                multiple: this.options.multiple
            });
        },

        /**
         * Adds listeners to the dom
         * @private
         */
        _addListeners: function() {
            var container = this.container,
                inner = container.querySelector('.inner'),
                input = container.querySelector('input');

            inner.addEventListener('dragenter', function(evt) {
                inner.classList.add('droppable');
            });

            inner.addEventListener('dragleave', function() {
                inner.classList.remove('droppable');
            });

            inner.addEventListener('dragover', function(evt) {
                evt.preventDefault();
            });

            var self = this;
            inner.querySelector('ul').addEventListener('click', function(evt) {
                if (!evt.target.classList.contains('remove')) return;

                var i = parseInt(evt.target.getAttribute('data-index'));

                self.parsedFiles.splice(i, 1);

                self._update(self.parsedFiles);
            });

            inner.addEventListener('drop', function(evt) {
                evt.preventDefault();
                inner.classList.remove('droppable');
                self.parse(
                    _.toArray(evt.dataTransfer.files),
                    self._update.bind(self)
                );
            });

            input.addEventListener('change', function(evt) {
                self.parse(
                    _.toArray(this.files),
                    self._update.bind(self)
                );
            });
        },

        _update: function(parsedFiles) {
            parsedFiles = this.options.multiple ? parsedFiles : parsedFiles.slice(0, 1);
            this.parsedFiles = parsedFiles;

            var template = document.querySelector("#uploader_files").textContent;
            this.container.querySelector('ul').innerHTML = _.template(template, {
                files: parsedFiles
            });

            this.options.onUpload(this.options.multiple ? parsedFiles : parsedFiles[0]);
        }
    });



    //
    // Util functions
    //

    /**
     * does nothing
     */
    function noop() {}

    /**
     * Parses an array of files into JSON
     * @param {Array} files
     * @param {Function} callback
     */
    function parse(files, callback) {

    }

})();
