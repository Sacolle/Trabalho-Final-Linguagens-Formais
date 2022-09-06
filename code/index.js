const fs = require('fs')

const fileAutomato = process.argv[2]
const fileWords = process.argv[3]
if (fileAutomato == undefined || fileWords == undefined){
	console.log("Faltando o nome do Arquivo")
	return
}

const automatoRaw = fs.readFileSync(fileAutomato ,'utf-8')
const words = fs.readFileSync(fileAutomato ,'utf-8')

class Automato {
	constructor(name, estados, tokens, inicial, finais, rawStates){
		this.name = name
		this.estados = new Set(estados)
		this.tokens = new Set(tokens)
		this.inicial = inicial
		this.finais = new Set(finais)

		this.curr = inicial
		this.stateTable = parseStates(estados, rawStates);
	}
	step(char){
		if(!this.tokens.has(char)){
			return false;
		}
		let table = this.stateTable.get(this.curr);
	}
}

function parseStates(estados, rawStates){
	let table = new Map(estados.map(val=>[val,new Map]));
	//adiconar
}

