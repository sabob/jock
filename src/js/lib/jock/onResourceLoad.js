require.onResourceLoad = function(context, map, depArray) {
    var obj = context.defined[map.name];

    if (obj) {
        if (obj.prototype) {
            if (!obj.prototype.id) {
                obj.prototype.id = map.id;
                obj.id = map.id;
            }
        } else {
            if (!obj.id) {
                obj.id = map.id;
            }
        }
    }
};