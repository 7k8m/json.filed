'use strict'
let jf = require('json.filed');
let path = require('path');
//https://github.com/henridf/apache-spark-node
let spark = require('apache-spark-node')('');

var count = 0;
let preparer =
  jf.filed( './msg01.json' )
  .write( { msg: 'Hello World Bye World' } )
  .pass(
    () => {
      jf.filed( './msg02.json' )
      .write( { msg: 'Hello json.filed Goodbye json.filed' } )
      .pass(
        () =>{
          runSpark.exec();
        }
      ).exec();
    }
  ).plan();

let runSpark =
  jf.filed([ './msg01.json', './msg02.json' ])
  .collect( ( msgsObj ) => {
    //https://github.com/henridf/apache-spark-node#word-count-aka-big-data-hello-world
    let msgDataFrame = spark.sqlContext.createDataFrame(msgsObj);

    let F = spark.sqlFunctions;
    let splits = msgDataFrame.select(F.split(msgDataFrame.col("msg"), " ").as("words"));

    let occurrences = splits.select(F.explode(splits.col("words")).as("word"));
    let counts = occurrences.groupBy("word").count()

    counts.sort(counts.col("count")).show()

  },'./msgs.json')
  .plan();

preparer.exec();

/*
Result is as next.
+----------+-----+
|      word|count|
+----------+-----+
|   Goodbye|    1|
|       Bye|    1|
|     World|    2|
|json.filed|    2|
|     Hello|    2|
+----------+-----+
*/
