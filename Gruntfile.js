module.exports = function(grunt) {

  // Project configuration
  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: 'bower_components'
        }
      }
    },
    bower_concat: {
      all: {
        dest: 'bower_components/concat.js',
        exclude: [ 'fontawesome' ]
      }
    },
    uglify: {
      options: {
        banner: '/*! Medic Mobile <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'static/dist/inbox.js': [
            'bower_components/concat.js',
            'static/js/jquery.spreadsheet.js',
            'static/js/inbox.js',
            'static/js/controllers.js',
            'static/js/services.js'
          ]
        }
      }
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'static/js/inbox.js',
        'static/js/services.js',
        'static/js/controllers.js'
      ]
    },
    less: {
      all: {
        files: {
          'static/dist/app.css': 'static/css/app.less',
          'static/dist/inbox.css': 'static/css/inbox.less'
        }
      }
    },
    copy: {
      resources: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/select2/*.gif',
              'bower_components/select2/*.png'
            ], 
            dest: 'static/dist/'
          },
        ]
      }
    },
    exec: {
      deploy: {
        cmd: function() {
          return 'kanso push http://' + grunt.option('user') + ':' + 
            grunt.option('pass') + '@localhost:5984/medic';
        }
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default tasks
  grunt.registerTask('default', [
    'jshint',
    'bower:install',
    'bower_concat',
    'uglify',
    'less',
    'copy:resources'
  ]);

  grunt.registerTask('dev', [
    'default',
    'exec:deploy'
  ]);

};