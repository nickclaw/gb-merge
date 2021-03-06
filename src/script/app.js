angular.module('app', ['ui.grid'])

.config([
    '$compileProvider',
    function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^blob/);
    }
])

.directive('section', [
    function() {

        return {
            restrict: 'E',
            templateUrl: 'src/template/section.html',
            transclude: true,
            replace: true,
            scope: {
                title: '@name'
            },
            link: function($scope, elem) {
                $scope.expanded = true;

                // hack becaue jqLite#find can't take class names
                elem.find('span').on('click', function() {
                    $scope.expanded = !$scope.expanded;
                    $scope.$digest();
                });
            }
        };
    }
])

/**
 * Creates a scrollable 2 dimensional grid of objects
 */
.directive('grid', [
    function() {

        return {
            restrict: 'A',
            transclude: true,
            templateUrl: 'src/template/grid.html',
            scope: {
                grid: '='
            },
            link: function($scope, elem) {
                $scope.gridOptions = {
                    enableSorting: false,
                    enableCellEditOnFocus: false,
                };

                $scope.$watch('grid', function() {
                    if (!$scope.grid || !$scope.grid.length) return;
                    $scope.gridOptions.columnDefs = _.map($scope.grid[0], function(text, index) {
                        return {
                            name: text,
                            width: 150,
                            type: 'string',
                            field: index + ""
                        };
                    });

                    $scope.gridOptions.data = $scope.grid.slice(1);
                });
            }
        };
    }
])

/**
 * Creates a droppable area
 */
.directive('droppable', [
    function() {

        return {
            restrict: 'A',
            scope: {
                droppable: '&'
            },
            link: function($scope, element) {
                element.on('dragenter', function(evt) {
                    if (evt.target === element[0]) element.addClass('droppable');
                });

                element.on('dragleave', function(evt) {
                    if (evt.target === element[0]) element.removeClass('droppable');
                });

                element.on('dragover', function(evt) {
                    evt.preventDefault();
                });

                element.on('drop', function(evt) {
                    evt.preventDefault();
                    element.removeClass('droppable');
                    $scope.droppable({
                        files: evt.dataTransfer.files
                    });
                });
            }
        };
    }
])

.directive('upload', [
    function() {

        return {
            restrict: 'A',
            transclude: true,
            replace: true,
            template: '<label><input style="display: none;" type="file" /><div ng-transclude></div></label>',
            scope: {
                'upload': '&'
            },
            link: function($scope, element) {
                var input = element.children().children()[0];
                input.addEventListener('change', function() {
                    $scope.upload({
                        files: input.files
                    });
                });
            }
        };
    }
])


/**
 * App Controller
 */
.controller('MainController', [
    '$scope',
    function($scope) {

        // array represent the current gradebook
        $scope.gradebook = null;

        // array representing the grades to add
        $scope.grades = null;

        // array representing the merged gradebook
        $scope.output = null;

        // the downloadable data url
        $scope.dataUrl = "";

        $scope.errors = {};

        // watch for either gradebook or grades to change value
        $scope.$watchGroup(['gradebook', 'grades'], merge);


        /**
         * To be moved into droppable
         */
        $scope.parse = function parse(type, files) {
            if ($scope[type] === undefined) throw new Error("Invalid `type`:", type);
            if (files.length < 1) $scope[type] = null;

            Papa.parse(files[0], {
                complete: function(results) {
                    if (results.errors.length) {
                        $scope.errors[type] = "Error parsing csv file.";
                        $scope[type] = null;
                    } else {
                        delete $scope.errors[type];
                        $scope[type] = results.data;
                    }
                    $scope.$digest();
                },
                error: function(results) {
                    $scope.errors[type] = "Error parsing csv file.";
                }
            });
        };

        /**
         * Merges two files and prepares for download
         */
        function merge(values) {

            // case where gradebook is missing
            // there can be no output
            if ( !values[0] ) {
                $scope.output = null;
                $scope.dataUrl = "";
                return;
            }

            var gradebook = values[0],
                grades = values[1],
                output = [];

            // build list of assignments by index
            // this way we can map column name to an array index
            // in O(1)
            var assignments = {};
            _.each(gradebook[0], function(assignment, index) {
                if (!isNaN(parseFloat(gradebook[1][index]))) {
                    assignments[assignment] = index;
                }
            });

            /*
             * build list of students like:
             * {
             *    "netida": {'Student': 'last, first', 'ID': '123432'...},
             *    "netidb": { ... }
             * }
             *
             * and order array like
             *
             * ["netidb", "netida"]
             *
             * this way we can iterate over the array of id's in
             * the correct order (when we need to), but still freely
             * get and modify a students info in O(1) by accessing with
             * their netID
             */
            var students = {};
            var studentOrder = [];
            var sisIndex = 3; // magic number, please don't change canvas..
            _.each(gradebook.slice(2), function(student) {
                var netId = student[sisIndex];

                if (!netId) return;

                netId = netId.toLowerCase();

                studentOrder.push(netId);
                students[netId] = _.zipObject(gradebook[0], student);
            });


            // if there any grades, merge them with the gradebook
            // data and add them to the canvas file
            if (grades) {

                // read top row to get assignment names
                var newAssignments = grades[0].slice(1);

                // now for each remaining row (e.g. each student)
                _.each(grades.slice(1), function(row) {

                    // get the netID
                    // split on the @ sign so teachers can easily make
                    // student uw emails instead of netids
                    var netId = row[0].toLowerCase().split('@')[0];

                    _.each(row.slice(1), function(score, index) {
                        if (!students[netId]) {
                            console.log('UHOH', netId);
                            return;
                        }
                        console.log('YAY', netId);
                        students[netId][newAssignments[index]] = score;
                    });
                });
            }

            // copy headers into output
            output.push(gradebook[0]);
            output.push(gradebook[1]);

            // copy each students
            _.each(studentOrder, function(name) {
                console.log(students[name]);
                output.push(_.values(students[name]));
            });

            $scope.output = output;

            var blob = new Blob([
                Papa.unparse($scope.output)
            ]);
            $scope.dataUrl = URL.createObjectURL(blob);
        }
    }
]);
