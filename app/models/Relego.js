Relego = {}; // global namespace for Relego for webOS

// db stuff + helper objects from webOS101

Relego.db = {
	'info': {
		'name': 'ext:Relego',
		'version': '1.1'
	},
	'dbColumn': function(definition) {
	    var that = {}, sql;
	 
	    definition = definition || {};
	 
	    that.get_name = function() {
	        return definition.name;
	    };
	 
	    that.get_type = function() {
	        return definition.type;
	    };
	 
	    that.get_constraints = function() {
	        return definition.constraints;
	    };
	 
	    that.get_buildSql = function() {
	        sql = definition.name + ' ' + definition.type;
	        if (definition.constraints) {
	            sql += ' ' + definition.constraints.join(' ');
	        }
	        return sql;
	    };
	 
	    return that;
	},
	'dbTable': function(definition){
		var that = {}, sql, i;
		
		definition = definition || {};
		
		if (!definition.columns) {
			try {
				throw ('No columns defined for table: ' + definition.name);
			} 
			catch (e) {
				console.log(e);
			}
		}
		
		that.get_name = function(){
			return definition.name;
		};
		
		that.get_columns = function(){
			return definition.columns;
		};
		
		that.get_createSql = function(){
			if (!definition.columns) {
				try {
					throw ('No columns defined for table: ' + definition.name);
				} 
				catch (e) {
					console.log(e);
				}
				
			}
			var columnArray = [];
			sql = "CREATE TABLE IF NOT EXISTS '" + definition.name + "' (";
			for (i = 0; i < definition.columns.length; i += 1) {
				columnArray.push(definition.columns[i].get_buildSql());
			}
			sql += columnArray.join(',') + ")";
			return sql;
		};
		
		that.get_insertSql = function(record){ // record is in JSON format
			try {
				if (!definition.columns) {
					throw ('no columns defined for table: ' + definition.name);
				}
				if (!record) {
					throw ('no record to insert into table: ' + definition.name);
				}
			} 
			catch (e) {
				console.log(e);
			}
			
			var sqlArray = [];
			var values = [];
			var inserts = [];
			var columns = []
			sql = "INSERT OR REPLACE INTO '" + definition.name + "'";
			for (i in record) {
				inserts.push('?');
				values.push(record[i]);
				columns.push(i.toString());
			}
			sql += " (" + columns.join(', ') + ")";
			sql += " VALUES (" + inserts.join(', ') + ")";
			sqlArray.push(sql);
			sqlArray.push(values);
			return sqlArray;
		};
		
		that.get_selectSql = function(limiters){ // limiter is array of WHERE clauses in JSON format
			sql = "SELECT * FROM '" + definition.name + "'";
			if (!limiters) {
				limiters = [];
			}
			if (limiters.length > 0) {
				sql += " WHERE "
				for (i = 0; i < limiters.length; i += 1) {
					sql += limiters[i].column + limiters[i].operand + "'" + limiters[i].value + "'" + (limiters[i].connector ? " " + limiters[i].connector + " " : "");
				}
			}
			return sql;
		};
		
		that.get_deleteSql = function(limiters){ // limiter is array of WHERE clauses in JSON format
			sql = "DELETE FROM '" + definition.name + "'";
			if (!limiters) {
				limiters = [];
			}
			if (limiters.length > 0) {
				sql += " WHERE "
				for (i = 0; i < limiters.length; i += 1) {
					sql += limiters[i].column + limiters[i].operand + "'" + limiters[i].value + "'" + (limiters[i].connector ? " " + limiters[i].connector + " " : "");
				}
			}
			return sql;
		};
		
		
		return that;
	},
	'dbInstance': function(definition){
		var that = {};
		
		var update_schema = function(table){
			definition.schema[table.get_name()] = {
				'name': table.get_name(),
				'status': 'completed',
				'table': table
			};
		};
		
		definition = definition ||
		{ // some default db naming if the definition is empty
			'name': Mojo.appInfo.title.split(' ').join('-').toUpperCase() + '-' + Mojo.appInfo.version,
			'version': Mojo.appInfo.version,
			'displayName': Mojo.appInfo.title
		};
		
		definition.schema = {};
		if (definition.displayName) {
			definition.connection = openDatabase(definition.name, definition.version, definition.displayName);
		}
		else {
			definition.connection = openDatabase(definition.name, definition.version);
		}
		
		that.get_name = function(){
			return definition.name;
		};
		
		that.get_version = function(){
			return definition.version;
		};
		
		that.get_displayName = function(){
			return definition.displayName;
		};
		
		that.get_connection = function(){
			return definition.connection;
		}
		
		that.add_table = function(table, onSuccess, args){
			definition.connection.transaction(function(transaction){
				definition.schema[table.get_name()] = {
					'name': table.get_name(),
					'status': 'pending',
					'table': {}
				};
				transaction.executeSql(table.get_createSql(), [], function(transaction, results){
					try {
						update_schema(table);
						if (onSuccess) { // experimental
							(args) ? onSuccess.apply(definition, args) : onSuccess();
						}
					} 
					catch (e) {
						console.log(e);
					}
				}.bind(this),
				function(transaction, error){
					console.log('UNABLE TO ADD TABLE: ' + error.message);
				}.bind(this));
			}.bind(this));
		};
		
		that.get_schema = function(){
			return definition.schema;
		};
		
		return that;
	}
};

//Relego.appDb = openDatabase(Relego.db.info.name, Relego.db.info.version);
