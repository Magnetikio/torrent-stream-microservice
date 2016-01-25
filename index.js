var torrentStream = require( 'torrent-stream' ),
    segmenter = require( 'stream-segmenter' ),
    db = require( 'orchestrate' )( process.env.ORCHESTRATE_TOKEN ),
    io = require( 'socket.io' )( process.env.PORT )

io.on( 'connection', function( socket ) {
  console.log( '-> Incoming connection', socket.id )

  socket.on( 'songrequest', function( params ) {

    console.log( '-> Song request', params )

    db.get( 'song', params.id ).then( function( result ) {
      var magnet = result.body.magnet,
          filename = result.body.filename,
          engine = torrentStream( magnet )

      engine.on( 'ready', function() {
        engine.files.forEach( function( file ) {
          if( file.name.indexOf( filename ) == 0 ) {

            segmenter( file, { chunkSize: 256000 }, function( id, segment ) {
              if( id == 1 ) {
                socket.emit( 'songaudiochunk', segment )
              }
            }, function() {
            })
          }
        })
      })

    })
  })

})
