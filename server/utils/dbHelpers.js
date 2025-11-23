// Helper functions for database operations with sql.js

export function rowsToObjects(result) {
    if (!result || !result.length || !result[0].values) {
        return [];
    }
    
    const columns = result[0].columns;
    return result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, index) => {
            obj[col] = row[index];
        });
        return obj;
    });
}

export function rowToObject(result, columns) {
    if (!result || !result.length || !result[0].values.length) {
        return null;
    }
    
    const row = result[0].values[0];
    const obj = {};
    columns.forEach((col, index) => {
        obj[col] = row[index];
    });
    return obj;
}

