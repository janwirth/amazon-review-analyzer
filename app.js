import Scraper from '../amazon-review-scraper/'
import {MongoClient} from 'mongodb'
import assert from 'assert'

var scraper = new Scraper()

var dburl = 'mongodb://localhost:27017/reviews'

var products = [
    'http://www.amazon.com/Amazon-W87CUN-Fire-TV-Stick/dp/B00GDQ0RMG/ref=cm_cr_pr_product_top?ie=UTF8',
    'http://www.amazon.com/Ozeri-Digital-Multifunction-Kitchen-Elegant/dp/B004164SRA/ref=zg_bs_kitchen_2',
    'http://www.amazon.com/Blue-Microphones-Yeti-USB-Microphone/dp/B002VA464S/ref=zg_bs_musical-instruments_11'
]
var scrapeProducts = function (products) {
    for (var url of products) {
        scraper.scrapeProduct(url).then(function (productData) {
            MongoClient.connect(dburl, function (err, db) {
                assert.equal(null, err);
                var collection = db.collection('products');
                productData._id = productData.id;
                delete productData.id;
                collection.insert(productData);
                console.log('inserted product')
            });
        });
        scraper.scrapeProductReviews(url).then(function (reviews) {
            MongoClient.connect(dburl, function (err, db) {
                assert.equal(null, err);
                var collection = db.collection('reviews');
                for (var review of reviews){
                    review._id = review.id;
                    delete review.id;
                    collection.insert(review);
                    console.log('inserted review')
                }
                });
        });
    }
};

// scrapeProducts(products);



var analyzeReviews = function() {
    MongoClient.connect(dburl, function (err, db) {
        assert.equal(null, err);
        var rawdataCollection = db.collection('reviews');
        var productCollection = db.collection('products');
        var targetCollection = db.collection('analyzedReviews');
        rawdataCollection.find().toArray(function(err, res) {
            for (var rawReview of res){
                var processedReview = rawReview;
                processedReview.votes.quota = rawReview.votes.helpful / rawReview.votes.total
                processedReview.languageMetaData = {}
                processedReview.languageMetaData.length = processedReview.text.length
                delete processedReview.text;
                console.log(processedReview);
                // targetCollection.insert(review);
            }
            db.close()
        });
    });
}

analyzeReviews();
