export namespace main {
	
	export class ProxyImageResponse {
	    data: string;
	    contentType: string;
	
	    static createFrom(source: any = {}) {
	        return new ProxyImageResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = source["data"];
	        this.contentType = source["contentType"];
	    }
	}

}

