module.exports = function(grunt) {

    grunt.initConfig({

        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    precision: 5,
                    update: false
                },

                files: {
                    'build/style/style.css': 'src/style/style.scss'
                }
            }
        },

        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                    report: 'min',
                    preserveComments: 'some'
                },

                files: {
                    'build/script/main.js': 'src/script/**/*.js'
                }
            }
        },

        bowercopy: {
            dist: {
                options: {
                    srcPrefix: 'lib',
                    destPrefix: 'build/lib'
                },
                files: {
                    'lodash.js': 'lodash/dist/lodash.min.js',
                    'papaparse.js': 'papa-parse/papaparse.min.js'
                }
            }
        },

        copy: {
            html: {
                files: [{
                    cwd: 'src',
                    src: '**/*.html',
                    dest: 'build',
                    expand: true,
                    flatten: false
                }]
            },

            image: {
                files: [{
                    cwd: 'src',
                    src: '**/*.png',
                    dest: 'build',
                    expand: true,
                    flatten: false
                }]
            },


        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-bowercopy');

    grunt.registerTask('default', [
        'sass',
        'uglify',
        'bowercopy',
        'copy:html',
        'copy:image'
    ]);
};
