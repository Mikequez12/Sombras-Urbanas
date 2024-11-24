var commands = {
	'background':function(file) {
		document.app.style.backgroundImage = `url('${window.game.url}/backgrounds/${file}')`;
	},
	'addkey':function(key) {
		window.player.keys.push(key);
	},
	'set':function(k,v) {
	    const properties = k.split('.');
	    console.log(k);
	    let target = window.game.vars;
	    target[k] = v;
	    console.log(`[SET]: ${target}.${k} = ${v}`);
	}
};