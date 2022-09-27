class Automato {
	constructor(name, estados, tokens, inicial, finais, rawStates){
		this.name = name
		this.estados = new Set(estados)
		this.tokens = new Set(tokens)
		this.inicial = inicial
		this.finais = new Set(finais)

		this.curr = inicial
		this.stateTable = parseStates(estados, tokens, rawStates);
	}
	step(char){
		if(char == 'ε'){
			return true
		}
		if(!this.tokens.has(char)){
			return false;
		}
		let moves = this.stateTable.get(this.curr);
		if (moves.has(char)){
			this.curr = moves.get(char)
			return true
		}else{
			return false
		}
	}
	reset(){
		this.curr = this.inicial
	}
	final(){
		return this.finais.has(this.curr)
	}
	parseIgualdade(estado1,estado2){
		this.estados.delete(estado2)
		this.stateTable.delete(estado2)

		if(this.inicial == estado2){
			this.inicial = estado1
		}

		if(this.finais.has(estado2)){
			this.finais.delete(estado2)
		}

		this.parseTransicoes(estado2, estado1)
	}
	parseInutil(estado){
		this.estados.delete(estado)
		this.stateTable.delete(estado)

		if(this.inicial == estado){
			this.inicial = ''
			this.estados.clear()
			this.finais.clear()

			this.curr = ''
			this.stateTable.clear()

			return true
		}

		this.parseTransicoes(estado, null)

		return false
	}
	parseInatingivel(estado){
		this.estados.delete(estado)
		this.stateTable.delete(estado)

		if(this.finais.has(estado)){
			this.finais.delete(estado)
		}

		this.parseTransicoes(estado, null)
	}
	parseTransicoes(estado1, estado2){
		let moves

		for(let q of this.estados){
			moves = this.stateTable.get(q)
			for(let token of this.tokens){
				if(moves.has(token) && moves.get(token) == estado1){
					if(estado2 == null){
						moves.delete(token)
					}
					else{
						moves.set(token, estado2)
					}
				}
			}
		}
	}
	toString(){
		let tabela = ''
		this.stateTable.forEach((val,q0) => this.stateTable.get(q0).forEach((q1,char) => tabela += '(' + q0 + ',' + char + ',' + q1 + ')\n'))
		return `${this.name}
S: ${new Array(...this.estados).join(',')}
A: ${new Array(...this.tokens).join(',')}
i: ${this.inicial}
f: ${new Array(...this.finais).join(',')}

${tabela}`
	}
}

class Teste {
	constructor(estado1, estado2){
		this.estado1 = estado1
		this.estado2 = estado2
	}
}

function addPalavra(pal,where){
	let li = document.createElement("li")
	li.appendChild(document.createTextNode(pal))
	document.getElementsByClassName(where)[0].appendChild(li)
}


function clearPalavras(){
	document.getElementsByClassName("aceitas")[0].innerHTML = ''
	document.getElementsByClassName("rejeitas")[0].innerHTML = ''
}


function testePalavras(){
	let auto = window.automato
	if(auto == undefined){
		window.alert("Automato ainda não definido")
		return
	}
	let input = document.getElementById("palavrasInput").value
	auto.reset()
	for(let word of input.split('\n')){
		auto.reset()
		let undef = false
		for(ch of [...(word.trim())]){
			if(!auto.step(ch)){
				undef = true
				break;
			}
		}
		if (auto.final() && !undef){
			console.log(`aceita: ${word}`)
			addPalavra(word,"aceitas")
		}else{
			console.log(`rejeita: ${word}`)
			addPalavra(word,"rejeitas")
		}
	}
}

function parseAutomato(){
	let input = document.getElementById("autoInput").value
	let status = document.getElementById("statusAuto")
	let lines = input.split('\n')
	try{
		let name = lines[0];

		let estados = lines[1]
			.split(':')[1].trim()
			.split(',').map(val=>val.trim())
		
		let tokens = lines[2]
			.split(':')[1].trim()
			.split(',').map(val=>val.trim())
		
		let inicial = lines[3]
			.split(':')[1].trim()

		let finais = lines[4]
			.split(':')[1].trim()
			.split(',').map(val=>val.trim())
		
		let rawStates = lines.slice(5,lines.length).filter(val=>val != '')
		//window.automato = new Automato(name,estados,tokens,inicial,finais,rawStates)
		window.automato = minimize(new Automato(name,estados,tokens,inicial,finais,rawStates))
		status.innerText = "  Inicializado"
		status.style = 'color: green'

		document.getElementById("autoInput").value = window.automato

	}catch(e){
		window.alert(e)
		window.automato = undefined
		status.innerText = "  Não inicializado"
		status.style = 'color: red'
	}
}


function parseStates(estados, tokens, rawStates){
	let table = new Map(estados.map(val => [val,new Map]));
	rawStates.map((state)=>{
		return state.trim()
			.substr(1,state.length - 2)
			.split(',')
			.map(elem => elem.trim())
	}).forEach((trio)=>{
		let [de,char,para] = [...trio] 
		if(estados.includes(de) && tokens.includes(char) && estados.includes(para)){
			table.get(de).set(char,para)
		}
	})
	return table
}


function minimize(auto){
	let vazia, inat, testados = []

	for(let estado of auto.estados){
		inat = inatingivel(auto, [], estado, auto.inicial)

		if(inat){
			auto.parseInatingivel(estado)
		}
	}

	for(let estado1 of auto.estados){
		testados.push(estado1)
		for(let estado2 of auto.estados){
			if(!testados.includes(estado2)){
				if(iguais(auto, [], estado1, estado2)){
					auto.parseIgualdade(estado1,estado2)
					testados.push(estado2)
				}
			}
		}
	}
	
	for(let estado of auto.estados){
		if(inutil(auto, [], estado)){
			vazia = auto.parseInutil(estado)
		}

		if(vazia){
			break
		}
	}

	return auto
}


function iguais(auto, testados, estado1, estado2){
	let teste = new Teste(estado1, estado2), invTeste = new Teste(estado2, estado1)
	let finEst1 = auto.finais.has(estado1), finEst2 = auto.finais.has(estado2)
	let moves1, moves2

	if((finEst1 && !finEst2) || (finEst2 && !finEst1)){
		return false
	}

	if(testados.includes(teste) || testados.includes(invTeste)){
		return true
	}

	testados.push(teste)
	moves1 = auto.stateTable.get(estado1)
	moves2 = auto.stateTable.get(estado2)

	for(let token of auto.tokens){
		if(moves1.has(token)){
			if(!moves2.has(token)){
				return false
			}

			if(moves1.get(token) != moves2.get(token)){
				if(!iguais(auto, testados, moves1.get(token), moves2.get(token))){
					return false
				}
			}
		}
		else if(moves2.has(token)){
			return false
		}
	}

	return true
}


function inutil(auto, testados, estado){
	if(auto.finais.has(estado)){
		return false
	}

	if(testados.includes(estado)){
		return true
	}

	testados.push(estado)
	let moves = auto.stateTable.get(estado)

	for(let token of auto.tokens){
		if(moves.has(token) && !inutil(auto, testados, moves.get(token))){
			return false
		}
	}

	return true
}


function inatingivel(auto, testados, estado, pos){
	if(pos == estado){
		return false
	}

	if(testados.includes(pos)){
		return true
	}

	testados.push(pos)
	let moves = auto.stateTable.get(pos)

	for(let token of auto.tokens){
		if(moves.has(token) && !inatingivel(auto, testados, estado, moves.get(token))){
			return false
		}
	}

	return true
}