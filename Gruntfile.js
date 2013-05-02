module.exports = function(grunt) {


  grunt.initConfig({
    rsync: {
        "everything": {
            src: './',
            dest: '/home/ubuntu/nodesites/np/',
            host: 'ubuntu@ec2-50-112-196-1.us-west-2.compute.amazonaws.com',
            recursive: true,
            syncDest: true,
            compareMode: "checksum",
            exclude: ['grunt-config.json', 'node_modules', '.*']
        },
        "everything-dry": {
            src: './',
            dest: '/home/ubuntu/nodesites/np/',
            host: 'ubuntu@ec2-50-112-196-1.us-west-2.compute.amazonaws.com',
            recursive: true,
            syncDest: true,
            compareMode: "checksum",

            dryRun: true,
            exclude: ['grunt-config.json', 'node_modules', '.*']
        }
    }
  });

  grunt.loadNpmTasks('grunt-rsync');
  grunt.registerTask('d', ['rsync:everything-dry']);
  grunt.registerTask('default', ['rsync:everything']);


};
