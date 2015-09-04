module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    aws: grunt.file.readJSON("credentials.json"),

    s3: {
      options: {
        accessKeyId: "<%= aws.accessKeyId %>",
        secretAccessKey: "<%= aws.secretAccessKey %>",
        region: "<%= aws.region %>",
        bucket: "what-we-do"
      },
      css: {
        src: "css/**"
      },
      images: {
        src: "images/**"
      },
      js: {
        src: "js/**"
      },
      lib: {
        src: "lib/**"
      },
      index: {
        src: "index.html"
      }
    },

    cloudfront: {
      options: {
        accessKeyId: "<%= aws.accessKeyId %>",
        secretAccessKey: "<%= aws.secretAccessKey %>",
        distributionId: 'E2GPAFFDM4N7TW',
      },
      purge: {
        options: {
          invalidations: [
            '/*'
          ]
        }
      }
    },

    shell: {
        options: {
            stderr: false
        },
        pserve: {
            command: 'python -m SimpleHTTPServer 8000'
        }
    }
  });

  grunt.registerTask("s3-upload", ["s3:css", "s3:images", "s3:js", "s3:lib", "s3:index"]);
  grunt.registerTask("deploy", ["s3-upload", "cloudfront:purge"]);
  grunt.registerTask("serve", ["shell:pserve"]);

  grunt.registerTask("default", ["serve"]);

}
