// UTILITY
function uuid() {
	let uuid = '';
	const chars = '0123456789abcdef';

	for (let i = 0; i < 36; i++) {
		if (i === 8 || i === 13 || i === 18 || i === 23) {
			uuid += '-';
		} else if (i === 14) {
			uuid += '4';
		} else if (i === 19) {
			uuid += chars[(Math.random() * 4) | 8];
		} else {
			uuid += chars[(Math.random() * 16) | 0];
		}
	}

	return uuid;
}

// TYPES
export type ReplyHandler = (reply: string) => void;
export type Message = { [key: string]: string };

// MAIN
export default class Connection {
	readonly ws: WebSocket;
	readonly replyHandlers = new Map<string, ReplyHandler>();

	constructor() {
		const address = `ws://${window.location.origin}`;
		this.ws = new WebSocket(address);

		this.ws.onopen = () => {
			this.ws.onmessage = (ev: MessageEvent) => {
				this.receiveMessage(ev);
			};
		};
	}

	//messages
	receiveMessage(ev: MessageEvent<any>) {
		const message = ev.data.toString();

		try {
			this.parseMessage(message);
		} catch {
			console.error(`failed to parse message:\n${message}`);
		}
	}

	parseMessage(messageText: string) {
		const message = JSON.parse(messageText) as Message;
		const id = message.id;
		const reply = message.reply;

		const handler = this.replyHandlers.get(id);
		if (!handler) return this.handleNewMessage(message);

		handler(reply);
		if (reply == 'end') this.replyHandlers.delete(id);
	}

	handleNewMessage(message: Message) {
		const channel = message.channel;
		if (!channel) return console.warn(`received unrequested message with no channel:\n${JSON.stringify(message, null, 4)}`);

		switch (channel) {
		}
	}

	sendMessage(messageObject: Message, replyHandler: ReplyHandler) {
		messageObject.id = uuid();
		const messageText = JSON.stringify(messageObject);
		this.ws.send(messageText);
		this.replyHandlers.set(messageObject.id, replyHandler);
	}
}
