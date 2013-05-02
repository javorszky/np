
requirejs.config({
    enforceDefine: true,
    paths: {
        jquery: [
            'http://code.jquery.com/jquery-1.9.1.min', // your cdn
            'js/jquery.1.9.1.min' // your fallback
        ],
        ko: [
        	'http://ajax.aspnetcdn.com/ajax/knockout/knockout-2.2.1',
        	'js/ko221'
    	]
    }
});
define(function(require){
	var ko = require('ko'),
		$ = require('jquery');
	// console.log(ko);


    var BlogEntries = function(entries) {
        this.entries = ko.observableArray(entries);
        this.entryTitle = ko.observable('');
        this.entryText = ko.observable('');
        this.addEntry = function() {
            if(this.entryTitle() != "" && this.entryText() != "") {
                this.entries.push({
                    title: this.entryTitle(),
                    content: this.entryText()
                });
                console.log($);
                $.ajax({
                    url: 'http://localhost:3000/rest',
                    type: 'POST',
                    data: {
                        title: this.entryTitle(),
                        content: this.entryText()
                    }
                }).done(function(data){
                    console.log(data);
                });
                this.entryTitle('');
                this.entryText('');
            }
        }.bind(this);
    };

    $.ajax({
        url: 'http://localhost:3000/rest',
        type: 'GET'
    }).done(function(data){
        ko.applyBindings(new BlogEntries(data));

        // console.log('ajax done', data);
    });


	return function() {};
});
