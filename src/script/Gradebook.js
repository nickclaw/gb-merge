(function() {

    window.Gradebook = Gradebook;

    function Gradebook(data) {
        this.name = getName(data);
        this.assignments = getAssignments(data);
        this.students = getStudents(data);
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
                    var assignmentName = newAssignements[i];

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
            console.log(this);
            return [];
        }
    });


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
