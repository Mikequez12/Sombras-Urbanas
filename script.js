window.player = {}
window.player.keys = [];



document.addEventListener('DOMContentLoaded',function() { document.app = document.querySelector('app') })



function new_game(event) {
	document.querySelector('.menu-config').innerHTML = `
	<h2>New game</h2>

	<p style="margin-right:10px;">Game code</p>
	<input id='gamecode' style="width:500px" value="http://127.0.0.1:8000/vanilla" placeholder='Introduce game code'>
	<p></p>
	<div style='display:flex;'>
		<button onclick='start_game()' class='inverted' style='margin:auto;padding:0 100px'>Go</button>
	</div>
	`;
}

async function get_game_file(file) {
    try {
        const response = await fetch(`${window.game.url}/${file}`, { mode: 'cors' });
        
        if (!response.ok) {
            throw new Error('ERROR IN RESPONSE');
        }

        const data = await response.text();
        return data;
    } catch (error) {
        throw new Error('Error fetching the file: ' + error);
    }
}

async function start_game(event) {
	if (document.querySelector('div.toplevel') !== null) {
		return;
	};
	document.app.style.opacity = '.5';
	document.app.style.filter = 'blur(5px)';
	document.app.style.pointerEvents = 'none';
	window.game = {};
	window.game.url = document.querySelector('.menu-config>input#gamecode').value;
	try {
		let dat = await get_game_file('config.dat');
		config = JSON.parse(dat);
		var toplevel = document.body.appendChild(document.createElement('div'));
		toplevel.classList.add('toplevel');
		console.log(toplevel);
		toplevel.innerHTML = `
		<button class='cancel'>✖</button>
		<h1 style='margin:10px;'>${config.title}</h1>
		<div style='display:flex'>
			<div style='width:100%;margin:auto;'>
				<div style='display:block;text-align:center;'>
					<h3>Recommended age <span title='This age rating is determined by the creator. We are not responsible for any language content included, even when censorship is applied.' id='rating'>+${config.rating===undefined?'0':config.rating}</span></h3>
					<img style='width:70%;margin:auto;border-radius: 10px;box-shadow: 0 5px 15px 10px rgb(0 0 0 / 60%);'src='${window.game.url}/icon.ico' alt='icon'>
					<div style='height:30px;display:block'></div>
					<button id='create_game' class='inverted' style='margin:auto;padding:15px;width:200px'>Create game</button>
				</div>
			</div>
			<div style='width:100%;'>
				<h2>Language</h3>
				<div style='display:flex;'>
					<select style='margin:auto;min-width:250px;' id='lang'>
						${
							Object.keys(config.langs).map(v => `<option style='color:black;border-radius:5px;'>${v}</option>`).join('')
						}
					</select>
				</div>
				<h2>Restrictions</h2>
				<div style="text-align:center;">Censor<input id='censor' style='margin-left:15px;transform:scale(1.5)' type="checkbox"/></div>
				<h2>Player name</h2>
				<p style="text-align:center;"><input id='player_name' /></p>
				<h2>Sex</h2>
				<p style="text-align:center;"><select id='player_gender'><option>Male</option><option>Female</option></select></p>
			</div>
		</div>
		<br>
		`
		toplevel.querySelector('#create_game').addEventListener('click',create_game);
		toplevel.querySelector('.cancel').addEventListener('click',cancel_start_game);
	} catch (error) {
		alert(error)
		cancel_start_game(false);
	}
}

var script_readed = false;

async function read_script() {
	script_readed = false;
	let next_button = document.querySelector('.nxt-btn');
	next_button.classList.add('disabled');
	let line = window.game.script[window.line];

	if (typeof line === typeof '' && line[0] === '!') {
		// line = line.replaceAll('{player.name}',window.game.player_name)

		let command = line.slice(1).replace('(',';').slice(0,-1).split(';');
		commands[command[0]](...command.slice(1).map((v) => eval(v)));
		window.line++;
		read_script();
	} else if (line['.type']) {
		if (line['.type'] === 'CHOOSE') {
			let buttons = [];
			let choices = Object.fromEntries(Object.entries(line).filter(([k,v]) => k != '.type'));
			for (let [k,v] of Object.entries(choices)) {
				buttons.push(document.app.querySelector('.choicediv').appendChild(document.createElement('button')).appendChild(document.createElement('span')));
				k = k.replace(/get{(.*?)}/g, (match, key) => window.game.vars[key] || match);
				buttons[buttons.length-1].innerText = k;
				buttons[buttons.length-1].parentElement.classList.add('choice');
				buttons[buttons.length-1].parentElement.addEventListener('click', async function() {
					document.querySelectorAll('button.choice').forEach((btn) => {
						btn.style.pointerEvents = 'none';
						btn.style.opacity = '0';
						setTimeout(function() {
							btn.remove();
						}, 300)
					});
					window.game.script.splice(window.line+1,0,...v);
					window.line++;
					await read_script();
				})
				alert(`K: ${k}\nV: ${v}`);
			}
		} else if (line['.type'] === 'CONDITION') {
			line['.condition'] = line['.condition'].replace(/get{(.*?)}/g, (match, key) => window.game.vars[key] || match);
			if (eval(line['.condition']) === true) {
				window.game.script.splice(window.line+1,0,...line['.true']);
			} else {
				window.game.script.splice(window.line+1,0,...line['.false']);
			};
			window.line++;
			await read_script();
		}
	} else {
		line = [
			line[0].replace(/get{(.*?)}/g, (match, key) => window.game.vars[key] || match),
			line[1].replace(/get{(.*?)}/g, (match, key) => window.game.vars[key] || match)
		];

		if (window.game.censor) {
			line[1] = line[1].replace(/{censorship\('([^']+)'\)}/g, (match, p1) => {
    return '*'.repeat(p1.length)});
		} else {
			line[1] = line[1].replace(/{censorship\('([^']+)'\)}/g, (match, p1) => {
    return p1});
		};
		let name_container = document.querySelector('.name-container>span');
		name_container.innerText = line[0];
		let text_container = document.querySelector('.txt-container');
		text_container.innerText = '';

		said = line[1];

		for (let i = 0; i < line[1].length; i++) {
			let timeout = setTimeout(() => {
				text_container.textContent = `${text_container.textContent}${line[1][i]}`;
			},i*30);
			timeouts.push(timeout);
		};
		window.line++;
		timeout_end = setTimeout(function() {
			next_button.classList.remove('disabled');
			script_readed = true;
		},line[1].length*30+60)
	}
}

var said = null;
var timeouts = [];
var timeout_end = null;

function cancel_start_game(event) {
	if (event !== false) {
		let toplevel = event.target.parentElement;
		toplevel.remove();
	}

	document.app.style.opacity = '1';
	document.app.style.filter = '';
	document.app.style.pointerEvents = 'all';
}

async function create_game(event) {
	window.game.player_name = document.querySelector('#player_name').value;
	window.game.censor = document.querySelector('#censor').checked;
	if (window.game.player_name.replaceAll(' ','') === '') {
		alert('Invalid name');
		return;
	};
	window.game.vars = {
		'default.player.gender':window.game.player_name = document.querySelector('#player_gender').value,
		'default.player.name':window.game.player_name = document.querySelector('#player_name').value
	};
	document.app.style.backgroundImage = 'none';

	let toplevel = event.target.parentElement.parentElement.parentElement.parentElement;
	document.app.querySelectorAll('*').forEach((t) => {t.remove()});
	let lang = config.langs[event.target.parentElement.parentElement.parentElement.querySelector('div>#lang').value];
	toplevel.remove();

	var script = await get_game_file(`scripts/${lang}.json`);
	script = script.replace(/\/\*.*?\*\//g, ""); // Elimina comentarios /**/
	script = JSON.parse(script);
	window.game.script = script;

	console.log(script);

	let choicediv = document.app.appendChild(document.createElement('div'));
	choicediv.classList.add("choicediv");

	let text_container = document.app.appendChild(document.createElement('div'));
	text_container.classList.add('txt-container');
	text_container.innerHTML = '<div></div>';

	let name = document.app.appendChild(document.createElement('div'));
	name.classList.add('name-container');
	name.innerHTML = `<span></span>`;

	let btn = document.app.appendChild(document.createElement('next-button'));
	btn.classList.add('nxt-btn');
	btn.classList.add('disabled');
	btn.addEventListener('click',async function() {await read_script()});

	let topbar = document.app.appendChild(document.createElement('div'));
	topbar.classList.add('topbar');

	let save = topbar.appendChild(document.createElement('menubtn'));
	save.classList.add('save');

	document.app.style.opacity = '1';
	document.app.style.filter = '';
	document.app.style.pointerEvents = 'all';

	window.line = 0;

	await read_script();
}

document.addEventListener('keydown',async function(event) {
	if (event.key==='Enter') {
		if (script_readed === true) {
			await read_script()
		} else {
			timeouts.forEach((t) => { clearTimeout(t) });
			document.querySelector('.txt-container').textContent = said;

			clearTimeout(timeout_end);
			document.querySelector('.nxt-btn').classList.remove('disabled');
			script_readed = true;
		}
	}
});