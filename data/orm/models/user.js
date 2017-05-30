module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        name: DataTypes.STRING
    }, {
    	timestamps: false,
    	freezeTableName: true,
    	tableName:"User"//,
        // associate: function(models) {
        //     User.hasMany(models.Post);
        // }
    });

    return User;
}