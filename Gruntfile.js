/*jshint node:true, maxstatements:false*/

module.exports = function(grunt) {

    var MINJS = ~~grunt.option('minjs');

    var expall = require('./expall');

    // Automatically load grunt tasks
    require('load-grunt-tasks')(grunt);

    // Show timing of each grunt task at the end of build
    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({

        // Project configuration.
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: 'dist',
                    hostname: 'localhost',
                    debug: true,
                    keepalive: true
                }
            }
        },

        pkg: grunt.file.readJSON('package.json'),

        babel: {
            options: {
                sourceMap: false,
                loose: true,
                modules: 'amd',
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: [
                        '**/*.js',
                        '!require.config.js',
                        '!lib/**/*',
                    ],
                    dest: 'dist/',
                }]
            }
        },

        'string-replace': {
            newmod: {
                files: {},
                options: {}
            }
        },

        watch: {
            app: {
                files: [
                    'src/**/*.html',
                    'src/**/*.js',
                    'src/css/**/*',
                    'src/**/*.frag',
                    'src/**/*.vert',
                    '!src/mods.js', // this file is autogenerated
                    '!src/effects.js', // this file is autogenerated
                    '!src/require.config.js'
                ],
                tasks: ['build:dev'],
                options: {
                    interrupt: true,
                    atBegin: true,
                },
            },
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: ['jshint:gruntfile'],
                options: {
                    reload: true,
                },
            },
        },

        bowerRequirejs: {
            'merge-into-config': {
                rjsConfig: 'src/require.config.js',
                options: {
                    exclude: [],
                    transitive: true,
                }
            }
        },

        requirejs: {
            compile: {
                options: {
                    // All options:
                    // https://github.com/jrburke/r.js/blob/master/build/example.build.js

                    baseUrl                 : 'dist/',
                    name                    : 'app',
                    out                     : 'dist/bundle.js',
                    mainConfigFile          : 'dist/require.config.js',
                    optimize                : ['none', 'uglify2'][MINJS],
                    optimizeCss             : 'none',
                    keepBuildDir            : true,
                    allowSourceOverwrites   : true,
                    inlineText              : true,
                    preserveLicenseComments : false,
                    generateSourceMaps      : false,
                    wrapShim                : true,
                    skipModuleInsertion     : false,
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
            },
            gruntfile: [
                'Gruntfile.js',
            ],
            all: [
                'src/**/*.js',
                '!src/lib/**/*',
                '!src/mods/**/*', // don't subject mod authors to the crushing burden of perfection
            ],
        },

        copy: {
            'src-to-dist': {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'src/',
                    dest: 'dist/',
                    src: '**/*'
                }]
            },
            'newmod': {
                src: 'src/mods/example/',
                dest: 'src/mods/',
            },
        },

        sync: {
            main: {
                files: [{
                    cwd: 'src',
                    src: [
                        '**/*',
                        '!**/*.js',
                        'require.config.js',
                        'lib/**/*',
                    ],
                    dest: 'dist'
                }],
                pretend: false,
                updateAndDelete: false,
                verbose: true
            }
        },

        clean: ['dist'],

    });

    // Default task(s).
    grunt.registerTask('default', []);
    grunt.registerTask('lint', ['jshint:all']);

    grunt.registerTask('newmod', function (target) {
        if (target) {
            var fs = require('fs');
            var modname = target.replace(/[^A-Za-z0-9_]/g, '');

            // if the destination already exists, complain
            if(fs.existsSync('src/mods/'+modname)) {
                grunt.log.error('A mod named ' + modname + ' already exists.  Please try another name.  Apologies!');
            }
            else {
                // destination is free and clear, create a mod!
                var examplepath = 'src/mods/example/example.js';
                var newpath = 'src/mods/'+modname+'/'+modname+'.js';

                grunt.file.copy( examplepath, newpath );

                var replace_files_obj = {};
                replace_files_obj[newpath] = newpath;
                grunt.config.set('string-replace.newmod.files', replace_files_obj);

                var replacements = [{
                    pattern: /example/g,
                    replacement: modname
                }];
                grunt.config.set('string-replace.newmod.options.replacements', replacements);

                grunt.task.run('string-replace:newmod');
            }
        }
        else {
            grunt.log.error('Please provide a name for your mod.  For example, grunt newmod:dinosaurs');
        }
    });

    grunt.registerTask('expall', function (target) {
        expall('src/effects');
        expall('src/mods');
    });

    grunt.registerTask('build', function (target) {
        var t = [];
        if (target !== 'dev') {
            t.push('clean'); // only do a full clean for production builds
        }
        t.push('expall');
        t.push('sync');
        t.push('babel:dist');
        if (target !== 'dev') {
            grunt.config.set('requirejs.compile.options.optimize', 'uglify2');
            t.push('requirejs');
        }
        return grunt.task.run(t);
    });

};
