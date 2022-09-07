const fs = require('fs')

const fileAutomato = process.argv[2] || "../p1/kevitos-automato.txt"
const fileWords = process.argv[3] || "../test.txt"
/*
if (fileAutomato == undefined || fileWords == undefined){
	console.log("Faltando o nome do Arquivo")
	return
}*/

const automatoRaw = fs.readFileSync(fileAutomato ,'utf-8')
const words = fs.readFileSync(fileWords ,'utf-8')

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
		console.log(char)
		if(!this.tokens.has(char)){
			console.log("token não existe")
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
	final(){
		return this.finais.has(this.curr)
	}
}

let auto = parseAutomato(automatoRaw)
let early = false
for(ch of [...words]){
	if(!auto.step(ch)){
		early = true
		break;
	}
}

if (auto.final() && !early){
	console.log("aceita")
}else{
	console.log("rejeita")
}



function parseAutomato(input){
	let lines = input.split('\n')
	
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

	/*
	console.log(name)
	console.log(estados)
	console.log(tokens)
	console.log(inicial)
	console.log(finais)
	console.log(rawStates)
*/
	return new Automato(name,estados,tokens,inicial,finais,rawStates)
}


function parseStates(estados, rawStates){
	let table = new Map(estados.map(val=>[val,new Map]));
	
	rawStates.map((state)=>{
		return state.trim()
			.substr(1,state.length - 2)
			.split(',')
			.map(elem => elem.trim())
	}).forEach((trio)=>{
		let [de,char,para] = [...trio] 
		table.get(de).set(char,para)
	})
	//console.log(table)
	return table
}

