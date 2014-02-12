module.exports = function (grunt) {
	var dev = 'dev';
	var dist = 'dist';

	grunt.initConfig({
		pkg : grunt.file.readJSON('./package.json'),

		clean: {
			dev: {
				src: [dev]
			},
			dist: {
				src: [dist]
			}
		},

		concat : {
			js: {
				src: [
					'vendor/plugins.js',
					'core/definePlugin.js',
					'core/ColorPickerCore.js',
					'core/core.js',
					'components/**/*.js'
				],
				dest: dev + '/ui-lib.js',
				separator: ";"
			},

			css: {
				src: ['stylesheets/**/*.css', 'components/**/*.css'],
				dest: dev + '/ui-lib.css'
			},


			docsJs: {
				src: [
					'docs/google-code-prettify/prettify.js',
					'docs/DocsApp.js',
					'docs/Utils.js',
					'docs/ScrollInterations.js',
					'docs/Templates.js',
					'docs/PluginDocsData.js'
				],
				dest: dev + '/docs/docs.js',
				separator: ";"
			},

			docsCss: {
				src: [
					'docs/google-code-prettify/tomorrow.css',
					'docs/index.css'
				],
				dest: dev + '/docs/docs.css'
			}
		},

		cssmin : {
			options : {
				banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			compress: {
				files: {
					"dist/ui-lib.min.css" : "<%= concat.css.dest %>",
					"dist/docs/docs.min.css" : "<%= concat.docsCss.dest %>"
				}
			}
		},

		uglify: {
			options : {
				banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			js: {
				src: '<%= concat.js.dest %>',
				dest: dist + '/ui-lib.min.js'
			},
			docsJs: {
				src: '<%= concat.docsJs.dest %>',
				dest: dist + '/docs/docs.min.js'
			}
		},

		watch: {
			js: {
				files: ["<%= concat.js.src %>"],
				tasks: ["concat:js"]
			},
			css: {
				files: ["<%= concat.css.src %>"],
				tasks: ["concat:css"]
			},
			settings: {
				files: ["<%= settings.template %>"],
				tasks: ["settings:dev"]
			},
			docs: {
				files: ["<%= docs.template %>",
					"<%= concat.docsJs.src %>",
					"<%= concat.docsCss.src %>",
					"<%= mdDocs.dev.options.files %>"],
				tasks: ['concat:docsJs', 'concat:docsCss', 'copy:devDocs', 'docs:dev', 'markdown:dev', 'mdDocs:dev']
			}
		},

		copy : {
			devImages : {
				files : [{
					expand : true,
					cwd : 'images',
					src : ['**'],
					dest : dev + '/images'
				}]
			},
			devDocs:{
				files:[{
					expand : true,
					cwd:'docs',
					src:['**'],
					dest: dev + '/docs'
				}]
			},
			distImages : {
				files : [{
					expand : true,
					cwd : 'images',
					src : ['**'],
					dest : dist + '/images'
				}]
			},
			distDocs:{
				files:[{
					expand : true,
					cwd:'docs',
					src:['**'],
					dest: dist + '/docs'
				}]
			}
		},

		jshint : {
			all : {
				options : {
					// Unnecessary semicolon.
					"-W032": true,

					"asi" : true,
					"expr" : true,
					"laxcomma" : true,
					"smarttabs" : true,
					"curly" : true,
					"eqeqeq" : false,
					"immed" : true,
					"latedef" : true,
					"newcap" : true,
					"noarg" : true,
					"sub" : true,
					"es5" : true,
					"undef" : true,
					"eqnull" : true,
					"browser" : true,
					"regexdash" : true,
					"loopfunc" : true,
					"node":true,
					"globals" : {
						"Wix":true,
						"jQuery" : true,
						"$":true
					}
				},
				files : {
					src : [
						'components/**/*.js',
						'core/**/*.js',
						'!**/~*.js', '!**/jquery.dd.js'
					]
				}
			}
		},

		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true,
				browsers: ['PhantomJS']
			}
		},

		mdDocs:{
			dev: {
				options: {
					files:['components/**/*.md'],
					inject: dev + '/docs/index.html'
				}
			},
			dist: {
				options: {
					files:['components/**/*.md'],
					inject: dist + '/docs/index.html'
				}
			}
		},

		settings:{
			template: 'html/template/settings.html',
			dev: {
				dest: dev + '/settings.html',
				context: {
					js: 'ui-lib.js',
					css: "ui-lib.css"
				}
			},
			dist: {
				dest: dist + '/settings.html',
				context: {
					js: 'ui-lib.min.js',
					css: 'ui-lib.min.css'
				}
			}
		},

		docs:{
			template: 'html/template/docs/index.html',
			dev: {
				dest: dev + '/docs/index.html',
				context: {
					js: '../ui-lib.js',
					css: "../ui-lib.css",
					docs: {
						js: 'docs.js',
						vendorJs: 'jquery.sticky-kit.min.js',
						css: 'docs.css',
						settings: '../settings.html?viewMode=standalone'
					}
				}
			},
			dist: {
				dest: dist + '/docs/index.html',
				context: {
					js: 'dist/ui-lib.min.js',
					css: 'dist/ui-lib.min.css',
					docs: {
						js: 'dist/docs/docs.min.js',
						vendorJs: 'dist/docs/jquery.sticky-kit.min.js',
						css: 'dist/docs/docs.min.css',
						settings: 'dist/settings.html?viewMode=standalone'
					}
				}
			}
		},

		markdown: {
			dev: {
				files: [{
					expand: true,
					src: 'docs/md/*.md',
					dest: dev,
					ext: '.html'}
				],
				options: {
					postCompile: function(html, context) {
						var source = grunt.file.read(dev + '/docs/index.html');
						source = source.replace('${{getting-started}}', html);
						grunt.file.write(dev + '/docs/index.html', source);
					}
				}
			},

			dist: {
				files: [{
					expand: true,
					src: 'docs/md/*.md',
					dest: dist,
					ext: '.html'}
				],
				options: {
					postCompile: function(html, context) {
						var source = grunt.file.read(dist + '/docs/index.html');
						source = source.replace('${{getting-started}}', html);
						grunt.file.write(dist + '/docs/index.html', source);
					}
				}
			}
		},

		compress: {
			main: {
				options: {
					archive: 'archive.zip'
				},
				files: [
					{src: ['dist/images/**', 'dist/settings.html', 'dist/ui-lib**'], dest: '/'}
				]
			}
		},

		server: {
			base: "dev",
			dist: "dist",
			web: {
				port: 8000
			}
		}


	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-markdown');
	grunt.loadTasks('tasks');

	grunt.registerTask('default', 'dist');
	grunt.registerTask('dev', ['server', 'clean:dev', 'concat', 'copy:devDocs', 'settings:dev', 'docs:dev', 'markdown:dev',  'mdDocs:dev', 'watch']);
	grunt.registerTask('dist', ['clean:dist', 'concat', 'uglify', 'cssmin', 'copy:distImages', 'copy:distDocs', 'settings:dist', 'docs:dist', 'markdown:dist', 'mdDocs:dist']);
	grunt.registerTask('release', ['dist', 'compress', 'release-create-upload']);

	grunt.registerTask('lint', ['jshint']);
};
