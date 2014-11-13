(function() {

    window.Gradebook = Gradebook;

    //
    // Constants
    //
    var STUDENT_HEADERS = ["Username", "Last Name", "First Name M.",
                           "Student Number", "Section/Group", "Status",
                           "Notes"];

    function Gradebook(data) {
        this.name = getName(data);
        this.exported = getExported(data);
        this.assignments = getAssignments(data);

        if (this.exported.indexOf('Exported') !== 0) throw new Error("Invalid format.");

        this.studentOrder = getOrder(data);
        this.students = getStudents(data);

        console.log(this);
    }

    _.extend(Gradebook.prototype, {

        /**
         * Merge the gradebook with external JSON.
         * JSON should be in the format of:
         *
         * [
         *   ["", name1, name2, name3, name4...],
         *   [sid, score1, score2, score3, score4...],
         *   [sid, score1, score2, score3, score4...],
         *   ...
         * ]
         *
         *
         * @param {Array} json
         */
        merge: function(json) {

            //
            // Merge assignments
            //
            var oldAssignments = this.assignments,
                newAssignments = json[0].slice(1);

            this.assignments = _.union(oldAssignments, newAssignments);

            //
            // Overwrite scores
            //
            var students = this.students;

            // for each of the students in the new file
            _.each(json.slice(1), function(student) {

                // get the id, if student no longer in gradebook, ignore
                var id = student[0];
                if (!students[id]) return;

                // otherwise, go through each score
                _.each(student.slice(1), function(score, i) {

                    // match it up with a name
                    var assignmentName = newAssignments[i];

                    // and overwrite saved score
                    students[id][assignmentName] = score;
                });
            });
        },

        /**
         * Format the gradebook into a JSON structure
         * that can be converted into proper CSV
         * @return {Array}
         */
        format: function() {
            var x = _.size(this.assignments),
                y = _.size(this.studentOrder) + 1,
                matrix = createMatrix(y, x);

            _.each(this.assignments, function(assignment, i) {
                matrix[0][1 + i] = assignment;
            });


            _.each(this.studentOrder, function(id, i) {
                if (id === ""){
                    matrix[1 + i][0] = "";
                } else {
                    var student = this.students[id];
                    matrix[1 + i][0] = id;
                }

                _.each(this.assignments, function(assignment, j) {
                    matrix[1 + i][j + 1] = student ? student[assignment] : "";
                });
            }, this);

            return matrix;
        }
    });

    /**
     * Creates a 2 dimensional matrix with a given size
     * @param {Integer} y
     * @param {Integer} x
     * @return {Array.<Array>}
     */
    function createMatrix(y, x) {
        return _.map(new Array(y), function() {
            return new Array(x);
        });
    }

    /**
     * Extracts the name of the gradebook
     * @private
     * @param {Array} raw - raw data from papaparse
     * @return {String}
     */
    function getName(raw) {
        return raw[0][0] || "";
    }

    /**
     * Extracts the export date of the gradebook
     * @private
     * @param {Array} raw - raw data from papaparse
     * @return {String}
     */
    function getExported(raw) {
        return raw[1][0];
    }

    /**
     * Extracts the assignemnts from the gradebook
     * @private
     * @param {Array} raw - raw data from papaparse
     * @return {Array}
     */
    function getAssignments(raw) {
        var row = raw[2],
            startIndex = row.indexOf('Assignment'),
            endIndex = row.indexOf('Total Score');

        return row.slice(startIndex + 1, endIndex);
    }

    function getOrder(raw) {

        var lastRow = _.findIndex(raw, function(v, i) { return i > 5 && v[0] === ""; }),
            students = raw.slice(5, lastRow);

        return _.map(students, function(student) {
            return student[3];
        });
    }

    /**
     * Extracts the students from the gradebook
     * @private
     * @param {Array} raw - raw data from papaparse
     * @return {Object}
     */
    function getStudents(raw) {
        var headers = raw[2],
            lastRow = _.findIndex(raw, function(v, i) { return i > 5 && v[0] === ""; } ),
            students = raw.slice(5, lastRow);

        return _.reduce(students, function(obj, student, i) {
            obj[student[3]] = _.zipObject(headers, student);
            return obj;
        }, {});
    }

})();
