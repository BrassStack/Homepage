function ToggleDisplay( obj )
{
    if( obj.style.fontSize == "0%" )
        obj.style.fontSize = obj.oldSize;
    else
    {
        obj.oldSize = obj.style.fontSize;
        obj.style.fontSize = "0%";
    }
    return true;
}

// REMOVE THIS LINE WHEN UPLOADING TO A WEB SERVER //
// This allows you to use localStorage on a local file in IE if you have the localhost IP address in trusted sites
!localStorage && (l = location, p = l.pathname.replace(/(^..)(:)/, "$1$$"), (l.href = l.protocol + "//127.0.0.1" + p));
/////////////////////////////////////////////////////

var pageSections = [];

function initPage()
{
    var savedLinks = JSON.parse( localStorage.getItem( 'savedLinks' ) );

    if ( savedLinks )
    {
        for ( var i = 0; i < savedLinks.length; i++ )
        {
            pageSections[i] = new Section( savedLinks[i]['label'], savedLinks[i]['links'] );
            pageSections[i].init( i );
        }
    }

    if ( pageSections.length == 0 )
    {
        // if nothing was found, bring up the dialogue box to add a link/section here
    }
}

function Section( label, links )
{
    this.label = label;
    this.links = links;

    this.init = function ( sectionId ) {
        var newSection = document.createElement( 'div' );
        newSection.className = 'main';
        /*
        NEED TO DO SOMETHING WITH THE SECTION LABEL
        */
        newSection.id = sectionId;
        document.getElementById( 'links' ).appendChild( newSection );

        if ( this.links.length )
        {
            for ( var i = 0; i < this.links.length; i++ )
            {
                this.links[i] = new Link( this.links[i]['href'], this.links[i]['label'], this.links[i]['imgSource'] );
                this.links[i].init( sectionId, i );
            }
        }
    }
}

function Link( href, label, imgSource )
{
    this.href      = href;
    this.label     = label;
    this.imgSource = imgSource;

    this.init = function ( sectionId, linkId ) {
        var newLink = document.createElement( 'a' );
        newLink.href = this.href;
        newLink.title = this.label;
        newLink.id = sectionId.toString() + '.' + linkId.toString();;
        
        var newSection = document.createElement( 'section' );
        var newDiv = document.createElement( 'div' );

        var newImg = document.createElement( 'img' );
        newImg.src = this.imgSource;

        var newLabel = document.createElement( 'p' );
        newLabel.innerHTML = this.label;

        newDiv.appendChild( newImg );
        newDiv.appendChild( newLabel );
        newSection.appendChild( newDiv );
        newLink.appendChild( newSection );
        document.getElementById( sectionId ).appendChild( newLink );
    }
}

function savePageState()
{
    if ( pageSections.length > 0 )
    {
        localStorage.setItem( 'savedLinks', JSON.stringify( pageSections ) );
    }
    else
    {
        localStorage.removeItem( 'savedLinks' );
    }
}

window.addEventListener
(
    'unload',
    function( evnt ) {
        savePageState();
    }
);


/*************************************************************************/
function debugFunc()
{
    if ( pageSections.length == 0 )
    {
        var newLink = [ { 'href':'https://www.google.com', 'label':'Google', 'imgSource':'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png' } ];
        pageSections[0] = new Section( 'Debug', newLink );
        pageSections[0].init( 0 );
    }
    else
    {
        alert( 'Page already has some stuff...' );
    }
}

function debugFunc2() {
    pageSections = [];
    if ( pageSections.length == 0 )
    {
        alert( 'pageSections cleared successfully' );
    }
    else
    {
        alert( 'pageSections NOT cleared successfully...?' );
    }
}
/*************************************************************************/
