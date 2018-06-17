const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sandbox');

const db = mongoose.connection;

db.on('error', err => {
    console.error(`connection error: ${err}`);
})

db.once('open', () => {
    console.log('db connection success!');

    const Schema = mongoose.Schema;
    const AnimalSchema = new Schema({
        type: {type: String, default: 'Goldfish'}, 
        color: String, 
        size:  {type: String},
        mass: {type: Number, default: 0.007},
        name: {type: String, default: 'Sally'}
    });

    // Pre hook middleware
    AnimalSchema.pre('save', function(next) {
        this.size = this.mass >= 100 ? 'big' : 'small';
        next();
    });

    AnimalSchema.statics.findSize = function(size, cb) {
        return this.find({ size: size }, cb);
    };

    AnimalSchema.methods.findSameColor = function(cb) {
        return this.model('Animal').find({color: this.color}, cb);
    }

    const Animal = mongoose.model('Animal', AnimalSchema);

    const elephant = new Animal({
        type: 'Elephant', 
        color: 'Grey', 
        mass: 6000,
        name: 'Laurance'
    });

    const fish = new Animal({});

    const animalData = [
        {
            type: 'Elephant', 
            color: 'Grey', 
            mass: 6000,
            name: 'Laurance'
        },
        {
            type: 'Cow', 
            color: 'Grey', 
            size: 'medium',
            mass: 200,
            name: 'Herbert'
        },
        elephant,
        fish
    ]

    Animal.remove({}, (err) => {
        if(err) console.error(err);
        // This is asynch so closing the db needs to be as a callback. 
        Animal.create(animalData, (err, animals) => {
            if(err) console.error(err);
            Animal.findOne({type: 'Elephant'}, (err, elephant) => {
                elephant.findSameColor((err, colorAnimals) => {
                    colorAnimals.forEach(animal => {
                        console.log(animal.name, animal.type, animal.color)
                    })
                    db.close(() => {
                        console.log('db connection closed');
                    })
                })
            })
        })
    });

})