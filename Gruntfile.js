/* jshint indent: 2 */
module.exports = function (grunt) {

    "use strict";

    /* CONFIGURATION =-=-=-=-=-=-=-=-=-=-=- */
    var THEME = "jehu",
        SRC = './src/', // source folder
        DIST = './dist/', // output folder
        SERVER_PORT = 3000;

    /* GRUNT INIT =-==-=-=-=-=-=-=-=-=-=-=- */
    grunt.initConfig({
        // package file
        pkg: grunt.file.readJSON('package.json'),

        // bower
        bower: {
            install: {
                options: {
                    targetDir: './src/vendor',
                    layout: 'byType',
                    install: true,
                    verbose: false,
                    cleanTargetDir: true,
                    cleanBowerDir: false,
                    bowerOptions: {
                        production: true
                    }
                }
            }
        },

        // generate pages from handlebar templates
        assemble: {
            options: {
                data: [SRC + 'data/assemble/*.{json,yml}'],
                flatten: true,
                helpers: SRC + 'templates/helpers/**/*.js',
                layout: 'site.hbs',
                layoutdir: SRC + 'templates/layouts',
                partials: SRC + 'templates/partials/*.hbs'
            },
            dev: {
                options: {
                    dev: true,
                    prod: false
                },
                files: [
                    {
                        expand: true,
                        cwd: SRC + 'templates/pages/',
                        src: '**/*.hbs',
                        dest: DIST
                    },
                    {
                        expand: true,
                        cwd: SRC,
                        src: 'posts/**/*.hbs',
                        dest: DIST
                    }
                ]
            },
            prod: {
                options: {
                    dev: false,
                    prod: true
                },
                src: SRC + 'templates/pages/*.hbs',
                dest: DIST
            },
            readme: {
                options: {
                    data: ['package.json'],
                    ext: '',
                    layout: ''
                },
                src: SRC + 'templates/misc/readme.md.hbs',
                dest: './'
            }
        },

        // automatically add prefixes
        autoprefixer: {
            options: {
                browsers: ['last 2 version', '> 1%', 'ff 17', 'ie 8', 'ie 7']
            },
            all: {
                files: [
                    {
                        expand: true,
                        src: ['*/**.css'],
                        cwd: SRC,
                        dest: SRC, // output to src so we can continue to run tasks
                        ext: '.css'
                    }
                ]
            }
        },

        // clear a directory before build
        clean: {
            all: [SRC + '/css', DIST]
        },

        // create a local server
        connect: {
            options: {
                hostname: 'localhost',
                port: SERVER_PORT,
                base: DIST
            },
            dev: {
                options: {
                    middleware: function(connect, options) {
                        return[
                            require('connect-livereload')(),
                            connect.mountFolder('./dist')
                        ]
                    }
                }
            }
        },

        // copy files
        copy: {
            options: {
                processContentExclude: ['.DS_Store', '.gitignore', '.sass-cache', 'node_modules', 'src/tests/**']
            },
            fonts: {
                files: [
                    {
                        cwd: SRC + 'fonts/themes/' + THEME + '/**',
                        dest: DIST + 'fonts/',
                        src: ['**.{ttf}']
                    }
                ]
            },
            images: {
                files: [
                    {
                        cwd: SRC,
                        dest: DIST,
                        src: ['img/**/*.[gif,jpeg,jpg,png]'],
                        expand: true,
                        filter: 'isFile'
                    }
                ]
            },
            json: {
                files: [
                    {
                        cwd: SRC,
                        dest: DIST,
                        src: ['**/*.json', '!**/assemble/*.json'],
                        expand: true,
                        filter: 'isFile'
                    }
                ]
            },
            scripts: {
                files: [
                    {
                        cwd: SRC,
                        dest: DIST,
                        src: ['js/**/*'],
                        expand: true,
                        filter: 'isFile'
                    }
                ]
            },
            styles: {
                files: [
                    {
                        cwd: SRC,
                        dest: DIST,
                        src: ['css/**'],
                        expand: true,
                        filter: 'isFile'
                    }
                ]
            },
            vendor: {
                files: [
                    {
                        cwd: SRC + '/vendor/css',
                        src: '**/*.css',
                        dest: SRC + 'sass/libs',
                        expand: true,
                        flatten: true,
                        filter: false,
                        rename: function (dest, src) {
                            var new_name = dest + '/_' + src.replace(/\.css$/, ".scss");
                            grunt.log.writeln(src + " renamed to " + new_name);
                            return new_name;
                        }
                    }
                ]
            }
        },

        // minify images
        imagemin: {
            build: {
                options: {
                    optimizationLevel: 3
                },
                files: [
                    {
                        expand: true,
                        cwd: SRC,
                        src: ['img/**/*.{gif,jpg,png}'],
                        dest: DIST
                    }
                ]
            }
        },

        jshint: {
            options: {
                browser: true,
                curly: true,
                devel: true,
                eqeqeq: true,
                evil: true,
                immed: true,
                indent: 2,
                regexdash: true,
                sub: true,
                trailing: true,
                unused: true,
                white: true,
                globals: {
                    jQuery: true,
                    modernizr: true
                },
                force: true // allow build to continue with errors
            },
            dev: {
                src: [SRC + 'js/**/*.js', '!' + SRC + '/js/libs/**/*.js', '!' + SRC + '/js/vendor/**/*.js']
            },
            gruntfile: {
                src: ['Gruntfile.js']
            }
        },

        jsonlint: {
            dev: {
                src: [ SRC + '**/*.json' ]
            }
        },

        sass: {
            options: {
                trace: true
            },
            dev: {
                options: {
                    sourcemap: true,
                    style: 'expanded'
                },
                files: [
                    {
                        cwd: SRC + 'sass',
                        src: ['./**/*.scss', '!./**/_*.scss', '!./**/themes/*.scss', './**/themes/' + THEME + '.scss'],
                        dest: SRC + 'css',
                        ext: '.css',
                        expand: true
                    }
                ]
            },
            prod: {
                options: {
                    sourcemap: false,
                    style: 'compressed'
                },
                files: [
                    {
                        expand: true,
                        src: ['**/*.scss', '!**/_*.scss'],
                        cwd: SRC + 'sass',
                        dest: SRC + 'css',
                        ext: '.min.css'
                    }
                ]
            }
        },

        // minify javascript
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: DIST + 'js/script.min.js.map'
            },
            prod: {
                files: [
                    {
                        expand: true,
                        src: ['js/**/*.js'],
                        cwd: SRC,
                        dest: DIST,
                        ext: '.min.js'
                    }
                ],
            }
        },

        // verify lowercase filenames
        verifylowercase: {
            all: {
                src: [SRC + '**/*']
            }
        },

        // update the version number of our package file
        version: {
            dev: {
                options: {
                    release: 'patch'
                },
                src: [
                    'package.json'
                ]
            },
            prod: {
                options: {
                    release: 'minor'
                },
                src: [
                    'package.json'
                ]
            }
        },

        // different watch options trigger different tasks
        watch: {
            options: {
                livereload: true,
                spawn: true
            },
            assemble: {
                files: ['src/**/*.hbs', '!src/templates/misc/readme.md.hbs', 'src/data/*.assemble.json'],
                tasks: ['assemble:dev']
            },
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: ['jshint:gruntfile', 'build:dev']
            },
            fonts: {
                files: ['src/fonts/**'],
                tasks: ['copy:fonts']
            },
            images: {
                files: ['src/img/**'],
                tasks: ['images']
            },
            json: {
                files: ['src/data/*.json', '!src/data/*.assemble.json'],
                tasks: ['json']
            },
            readme: {
                files: ['src/templates/misc/readme.md.hbs'],
                tasks: ['assemble:readme']
            },
            sass: {
                files: ['src/sass/**/*.scss'],
                tasks: ['styles:dev'],
                livereload: false
            },
            css: {
                files: ['src/css/**/*.css'],
                tasks: []
            },
            scripts: {
                files: ['src/js/**/*.js'],
                tasks: ['scripts:dev']
            }
        }
    });

    /* MODULES =-=-=-=-=-=-=-=-=-=-=-=-=-=- */

    // load every plugin in package.json
    grunt.loadNpmTasks('assemble');
    //grunt.loadNpmTasks('connect-livereload');
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    /* TASKS =-=-=-=-=-=-=-=-=-=-=-=-=-=-=- */

    // tasks for images, scripts and styles
    grunt.registerTask('images', ['imagemin:build']);

    grunt.registerTask('scripts:dev', ['jshint:dev', 'copy:scripts']);
    grunt.registerTask('scripts:prod', ['jshint:dev', 'copy:scripts', 'uglify:prod']);

    grunt.registerTask('json', ['jsonlint', 'copy:json']);

    grunt.registerTask('styles:dev', ['copy:vendor', 'sass:dev', 'autoprefixer', 'copy:styles']);
    grunt.registerTask('styles:prod', ['copy:vendor', 'sass:prod', 'autoprefixer', 'copy:styles']);

    // tasks to run a complete build
    grunt.registerTask('build:dev', ['verifylowercase', 'clean', 'assemble:readme', 'assemble:dev', 'images', 'json', 'scripts:dev', 'styles:dev']);
    grunt.registerTask('build:prod', ['bower:install', 'verifylowercase', 'clean', 'assemble:readme', 'assemble:prod', 'images', 'json', 'scripts:prod', 'styles:prod']);

    // main tasks
    grunt.registerTask('default', ['build:dev', 'connect:dev', 'watch']);
    grunt.registerTask('dev', ['build:dev']);
    grunt.registerTask('prod', ['build:prod']);

};
