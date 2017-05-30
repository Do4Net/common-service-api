module.exports = function(sequelize, DataTypes) {
    var Post = sequelize.define('Post', {
        title: DataTypes.STRING
    }, {
    	timestamps: false,
    	freezeTableName: true,
    	tableName:"Post"//,
        // associate: function(models) {
        //     Post.belongsTo(models.User);
        // }
    });

    return Post;
}