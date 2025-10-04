export namespace models {
	
	export class APIResponse__mooncaketv_services_User_ {
	    success: boolean;
	    data?: services.User;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new APIResponse__mooncaketv_services_User_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.data = this.convertValues(source["data"], services.User);
	        this.error = source["error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class APIResponse___map_string_interface____ {
	    success: boolean;
	    data: any[];
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new APIResponse___map_string_interface____(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.data = source["data"];
	        this.error = source["error"];
	    }
	}
	export class APIResponse___string_ {
	    success: boolean;
	    data: string[];
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new APIResponse___string_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.data = source["data"];
	        this.error = source["error"];
	    }
	}
	export class APIResponse_bool_ {
	    success: boolean;
	    data: boolean;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new APIResponse_bool_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.data = source["data"];
	        this.error = source["error"];
	    }
	}
	export class APIResponse_map_string_interface____ {
	    success: boolean;
	    data: Record<string, any>;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new APIResponse_map_string_interface____(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.data = source["data"];
	        this.error = source["error"];
	    }
	}
	export class APIResponse_string_ {
	    success: boolean;
	    data: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new APIResponse_string_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.data = source["data"];
	        this.error = source["error"];
	    }
	}

}

export namespace services {
	
	export class ProxyImageResponse {
	    data: number[];
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
	export class ProxyURLResponse {
	    data: number[];
	    contentType: string;
	
	    static createFrom(source: any = {}) {
	        return new ProxyURLResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = source["data"];
	        this.contentType = source["contentType"];
	    }
	}
	export class SpeedTestResult {
	    speedMBps: number;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new SpeedTestResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.speedMBps = source["speedMBps"];
	        this.error = source["error"];
	    }
	}
	export class User {
	    id: number;
	    username: string;
	    email: string;
	    user_role: string;
	    meta_data?: string;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.email = source["email"];
	        this.user_role = source["user_role"];
	        this.meta_data = source["meta_data"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}

}

