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
                    'lodash.js': 'lodash/dist/lodash.js',
                    'papaparse.js': 'papa-parse/papaparse.min.js',
                    'css-tooltips.css': 'css-tooltips/css-tooltips.css'
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

            other: {
                files: {
                    'build/startup.js': 'src/startup.js',
                    'build/manifest.json': 'src/manifest.json'
                }
            }
        },

        watch: {
            html: {
                files: 'src/**/*.html',
                tasks: ['copy:html']
            },

            sass: {
                files: 'src/**/*.scss',
                tasks: ['sass']
            },

            script: {
                files: 'src/**/*.js',
                tasks: ['concat', 'copy:other']
            }

        },

        concurrent: {
            watch: {
                options: {
                    logConcurrentOutput: true
                },
                tasks: ['watch:html', 'watch:sass', 'watch:script']
            }
        },

        concat: {
            dist: {
                src: 'src/script/**/*.js',
                dest: 'build/script/main.js'
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true
                },

                files: [{
                    cwd: 'src',
                    src: '**/*.html',
                    dest: 'build',
                    expand: true,
                    flatten: false
                }]
            }
        },

        imagemin: {
            dist: {
                files: [{
                    cwd: 'src',
                    src: '**/*.png',
                    dest: 'build',
                    expand: true,
                    flatten: false
                }]
            }
        },

        jst: {
            dist: {
                files: {
                    'build/script/templates.js': 'src/template/**/*.jst'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jst');

    grunt.registerTask('default', [
        'sass',
        'uglify',
        'bowercopy',
        'htmlmin',
        'imagemin',
        'copy:other',
        'jst'
    ]);

    grunt.registerTask('develop', [
        'sass',
        'concat',
        'bowercopy',
        'copy:html',
        'copy:image',
        'copy:other',
        'concurrent:watch'
    ]);
};
