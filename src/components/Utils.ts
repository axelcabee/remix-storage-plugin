

export class devutils {

    async log(...message:any){
        if (process.env.NODE_ENV === 'production') return;
        console.log(...message)
    }

    addSlash(file:string){
        if(!file.startsWith("/"))file="/" + file
        return file
    }
}