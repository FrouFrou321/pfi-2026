const VegetableView = {

    single: (vegetable) => {

        return {
            id: vegetable.id,
            category: vegetable.category,
            nom: vegetable.nom,
            prix: vegetable.prix,
            stock: vegetable.stock,
            origine: vegetable.origine,
            image: vegetable.image
        };

    },

    collection: (vegetables) => {

        return vegetables.map(VegetableView.single);

    }

};

export default VegetableView;