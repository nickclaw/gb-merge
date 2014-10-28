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
        this.input = document.createElement('input');
        this.label = document.createElement('label');

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

            var multiple = this.options.multiple;

            // will call the callback after called
            // for each file
            var done = _.after(files.length + 1, function() {
                callback(multiple ? parsedFiles : parsedFiles[0]);
            });

            // lazily map files by returning an empty
            // object and filling it later, wait until
            // all files have been parsed asynchronously
            // and there respective objects filled with data
            // before calling the callback
            var parsedFiles = _.map(files, function(file) {
                var data = {
                    data: undefined,
                    error: undefined
                };


                // if the file is the wrong type
                // or is too big, don't bother
                // parsing
                var error = this.validate(file);
                if (error) {
                    data.error = error;
                    _.defer(done);
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

                        done();
                    }
                });

                return data;
            }, this);

            // if there are no files at all
            // this will make the callback call
            done();
        },

        /**
         * Creates the uploader dom
         * @private
         */
        _createElements: function() {
            var container = this.container,
                input = this.input,
                label = this.label;

            // add classes/settings
            container.classList.add('uploader');
            input.id = _.uniqueId('input-');
            input.type = 'file';
            label.for = input.id;

            if (this.options.multiple) {
                input.multiple = "multiple";
            }

            // append children
            container.appendChild(input);
            container.appendChild(label);
        },

        /**
         * Adds listeners to the dom
         * @private
         */
        _addListeners: function() {
            this.label.addEventListener('dragenter', function() {

            });

            this.label.addEventListener('dragleave', function() {

            });

            this.label.addEventListener('dragover', function(evt) {
                evt.preventDefault();
            });

            var self = this;
            this.label.addEventListener('drop', function(evt) {
                evt.preventDefault();
                self.parse(
                    _.toArray(evt.dataTransfer.files),
                    self.options.onUpload
                );
            });

            this.input.addEventListener('change', function(evt) {
                self.parse(
                    _.toArray(this.files),
                    self.options.onUpload
                );
            });
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
