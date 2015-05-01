/**
 * Socket initialization
 * @type {Object}
 */
var socket = io();

/**
 * Mapping object with the HTML elements
 * @type {Object}
 */
var mapping = {
	buttonOpenMessageEdition: document.getElementById('buttonOpenMessageEdition'),
	messageEditionPanel: document.getElementById('messageEditionPanel'),
	messageTextarea: document.getElementById('messageTextarea'),
	numberCharactersLeft: document.getElementById('numberCharactersLeft'),
	sendTweetButton: document.getElementById('sendTweetButton'),
	inputTag: document.getElementById('tagInput'),
	tagContainer: document.getElementById('tagContainer'),
	numberConnectedUsersSpan: document.getElementById('numberConnectedUsers'),
	koalaPlural: document.getElementById('koalaPlural'),
	columnsList: document.getElementById('tweets-columns-list')
};

/**
 * Dashboard main module
 * @param  {Object} socket        Web socket
 * @return {[type]}               [description]
 */
var dashboard = (function (socket){
	var mainSidebar = null;
	var statisticsSidebar = null;
	var messagesDisplay = null;

	var socket = socket;

	var init = function(mapping, callback){

		// Create the main components of the application
		mainSidebar = new MainSidebar(mapping);
		statisticsSidebar = new StatisticsSidebar();
		messagesDisplay = new MessagesDisplay(mapping.columnsList);

		// Generate the defaults columns
		messagesDisplay.addColumn('user', 'Home');
		messagesDisplay.addColumn('tracking', 'Tracking');
		messagesDisplay.displayColumns();

		mainSidebar.init();

		// Emit a message to connect to the server
		socket.on('connect', function () {
			if(userId != undefined){
				socket.emit('auth', userId);
				console.log('Fires auth');
			}
		});

		callback();
	}

	var listen = function(){
		socket.on('tweet', function(message){
			if(message.streamSource == 'user' || message.streamSource == 'tracking'){
				var messageToDisplay = messagesDisplay.addOneMessage(message.tweet, message.streamSource);
				if(messageToDisplay != undefined){
					messagesDisplay.displayOneMessage(messageToDisplay);
				}
			}
			else if(message.streamSource == 'lists'){
				for (var list in message.tweet) {
					var messagesToDisplay = messagesDisplay.addAllMessages(message.tweet[list], list);
					if(messagesToDisplay != undefined){
						messagesDisplay.displayAllMessages(messagesToDisplay);
					}
				}
			}
		});

		socket.on('lists-list', function(listsObject){
			messagesDisplay.addColumnsTwitterLists(listsObject);
			for (var i = 0; i < listsObject.length; i++) {
				messagesDisplay.addColumn(listsObject[i].slug, listsObject[i].name);
			};
			messagesDisplay.displayColumns();
		});

		socket.on('home-timeline', function(timeline){
			var messagesToDisplay = messagesDisplay.addAllMessages(timeline, 'user');
			if(messagesToDisplay != undefined){
				messagesDisplay.displayAllMessages(messagesToDisplay);
			}
		});

		socket.on('delete tweet', function(message){
			messagesDisplay.deleteMessage(message);
		});

		socket.on('numberConnectedUsers', function(numberConnectedUsers){
			console.log('Receive update message: ', numberConnectedUsers);
			mainSidebar.updateNumberConnectedUsers(numberConnectedUsers);
		});

		socket.on('disconnect', function(){
			console.log('Got disconnect');
		})
	}

	return {
		init:init,
		listen:listen
	};

})(socket);

dashboard.init(mapping, function(){
	dashboard.listen();
});




