const FruitView = {

    single: (fruit) => {

        return {
            id: fruit.id,
            category: fruit.category,
            nom: fruit.nom,
            prix: fruit.prix,
            stock: fruit.stock,
            origine: fruit.origine
        };

    },

    collection: (fruits) => {

        return fruits.map(FruitView.single);

    }

};

export default FruitView;