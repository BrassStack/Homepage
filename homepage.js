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
        showAddDialogue();
    }

    // $.contextMenu({
    //     /**
    //      * - Need to finish context menu functionality
    //      * - Need to add import/export options (JSON)
    //      * - Need to add/remove section toggler in header on section add/remove
    //      */
    //     selector: 'section',
    //     callback: function( key, options ) {
    //         var m = "clicked: " + key + " on object " + options.$trigger[0].id;
    //         alert( m ); 
    //     },
    //     items: {
    //         "up": { name: "Move Up" },
    //         "down": { name: "Move Down" },
    //         "sep1": "---------",
    //         "delete": { name: "Delete" }
    //     }
    // });
}

function Section( label, links )
{
    this.label = label;
    this.links = links;
    
    this.id = null;

    this.init = function ( sectionId )
    {
        this.id = sectionId;

        var newSection = document.createElement( 'div' );
        newSection.className = 'main';
        newSection.id = this.id;
        if ( this.label != '#BLANK#' )
        {
            var newSectionTitle = document.createElement( 'h1' );
            newSectionTitle.innerHTML = this.label;
            newSection.appendChild( newSectionTitle );

            document.getElementById( 'sections' ).appendChild( newSection );

            var newSectionToggler = document.createElement( 'a' );
            newSectionToggler.id = this.label;
            newSectionToggler.class = 'toggle';
            newSectionToggler.href = 'javascript:ToggleDisplay( document.getElementById( "' + this.id + '" ) );';
            newSectionToggler.innerHTML = this.label;

            var header = document.getElementById( 'header' );

            if ( header.childNodes.length > 0 )
            {
                // \u00A0 = &nbsp;
                header.appendChild( document.createTextNode( '\u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0' ) );
            }

            header.appendChild( newSectionToggler );
        }
        else
        {
            var sections = document.getElementById( 'sections' );
            sections.insertBefore( newSection, sections.childNodes[0] );
        }


        if ( this.links.length )
        {
            for ( var i = 0; i < this.links.length; i++ )
            {
                /**
                 * USE this.addLink() HERE TO LIMIT REDUNDANCY????
                 */
                this.links[i] = new Link( this.links[i]['href'], this.links[i]['label'], this.links[i]['imgSource'] );
                this.links[i].init( this.id, i );
            }
        }
    }

    this.addLink = function ( link )
    {
        var newLinkId = this.links.length;
        this.links[newLinkId] = link;
        this.links[newLinkId].init( this.id, newLinkId );
    }
}

function Link( href, label, imgSource )
{
    this.href      = href;
    this.label     = label;
    this.imgSource = imgSource;

    this.id = null;

    this.init = function ( sectionId, linkId )
    {
        this.id = sectionId.toString() + '.' + linkId.toString();

        var newSection = document.createElement( 'section' );
        newSection.id = this.id;

        var newLink = document.createElement( 'a' );
        newLink.href = this.href;
        newLink.title = this.label;
        
        var newDiv = document.createElement( 'div' );

        var newImg = document.createElement( 'img' );
        newImg.src = this.imgSource;

        var newLabel = document.createElement( 'p' );
        newLabel.innerHTML = this.label;

        newDiv.appendChild( newImg );
        newDiv.appendChild( newLabel );
        newLink.appendChild( newDiv );
        newSection.appendChild( newLink );
        document.getElementById( sectionId ).appendChild( newSection );
    }
}

function addNewLink()
{
    var newLinkSection = document.getElementById( 'inputSection' ).value;
    if ( newLinkSection.trim() == '' )
    {
        newLinkSection = '#BLANK#'
    }

    var newLinkImg = document.getElementById( 'inputImg' ).value;
    if ( newLinkImg.trim() == '' )
    {
        newLinkImg = 'images/default_link.png'
    }

    var newLink = new Link
    (
        document.getElementById( 'inputUrl' ).value,
        document.getElementById( 'inputLabel' ).value,
        newLinkImg
    );

    var sectionNotFound = true;

    for ( var i = 0; i < pageSections.length; i++ )
    {
        if ( pageSections[i].label == newLinkSection )
        {
            pageSections[i].addLink( newLink );
            sectionNotFound = false;
            break;
        }
    }
    
    if ( sectionNotFound )
    {
        var i = pageSections.length;
        newLink = [ newLink ];

        pageSections[i] = new Section( newLinkSection, newLink );
        pageSections[i].init( i );
    }

    document.getElementById( 'addDialogue' ).classList.add( 'hidden' );
}

function showAddDialogue()
{
    document.getElementById( 'inputUrl' ).value   = '';
    document.getElementById( 'inputLabel' ).value = '';
    document.getElementById( 'inputImg' ).value   = '';

    document.getElementById( 'addDialogue' ).classList.remove( 'hidden' );
}


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
    // if ( pageSections.length == 0 )
    // {
    //     var newLink = [ { 'href':'https://www.google.com', 'label':'Google', 'imgSource':'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png' } ];
    //     pageSections[0] = new Section( 'Debug', newLink );
    //     pageSections[0].init( 0 );
    // }
    // else
    // {
    //     alert( 'Page already has some stuff...' );
    // }
}

function debugFunc2()
{
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
