var torrentStream = require( 'torrent-stream' ),
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

      console.log( 'magnet', magnet, 'filename', filename, engine )

      engine.on( 'ready', function() {
        engine.files.forEach( function( file ) {
          if( file.name.indexOf( filename ) == 0 ) {
            var stream = file.createReadStream()
            stream.on( 'data', function( chunk ) {
              socket.emit( 'songaudiochunk', chunk )
            })
          }
        })
      })

    })
  })

})
