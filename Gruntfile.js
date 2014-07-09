module.exports = function(grunt) {
  grunt.initConfig({
    pkg:grunt.file.readJSON('package.json'),
    karma:{
      unit:{
        configFile:'karma.conf.js',
        background:true
      }
    },

    watch:{
      karma: {
        files:[client/app/**/*],
        tasks:['karma:unit:run']
      }
    }
  });
  grunt.loadNpmTasks('grunt-karma');

}
