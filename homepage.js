// REMOVE THIS LINE WHEN UPLOADING TO A WEB SERVER //
// This allows you to use localStorage on a local file in IE if you have the localhost IP address in trusted sites
!localStorage && (l = location, p = l.pathname.replace(/(^..)(:)/, "$1$$"), (l.href = l.protocol + "//127.0.0.1" + p));
/////////////////////////////////////////////////////

/**
 * WISHLIST:
 * - Option to edit existing link (change image, label, url)
 * - Spacers are still sticking around in section togglers when deleted (but probably not worth fixing, page refresh takes care of it...)
 */

var pageSections = [];
var origSection = '';

var importing = false;
var importText = ''; // Since the import text is needed in the unload function, need to store it here; it appears that DOM element contents aren't available during unload.

function initPage()
{
    try {
        var savedLinks = JSON.parse( localStorage.getItem( 'savedLinks' ) );

        if ( savedLinks )
        {
            for ( var i = 0; i < savedLinks.length; i++ )
            {
                pageSections[i] = new Section( savedLinks[i]['label'], savedLinks[i]['links'], savedLinks[i]['state'] );
                pageSections[i].init( i );
            }
        }
    }
    catch( error ) {
        alert( 'Page data could not be loaded successfully - this is probably due to an error in import text.  If this was an import issue, the previous page state will now be reloaded.' );

        // Reset pageSections and DOM in case the first "try" added some content before failing
        pageSections = [];
        document.getElementById( 'sections' ).innerHTML = '';

        try {
            var backedUpLinks = JSON.parse( localStorage.getItem( 'backedUpLinks' ) );
            
            for ( var i = 0; i < backedUpLinks.length; i++ )
            {
                pageSections[i] = new Section( backedUpLinks[i]['label'], backedUpLinks[i]['links'], backedUpLinks[i]['state'] );
                pageSections[i].init( i );
            }
        }
        catch( error2 ) {
            alert('Load of backed up data failed; data was corrupt or did not exist.');
            pageSections = [];
            document.getElementById( 'sections' ).innerHTML = '';
        }
    }

    if ( pageSections.length == 0 )
    {
        showAddDialogue();
    }

    $.contextMenu({
        selector: 'section',
        items: {
            "up": { name: "Move Up", callback: function( key, options ) { moveLink( options.$trigger[0], 'up' ); } },
            "down": { name: "Move Down", callback: function( key, options ) { moveLink( options.$trigger[0], 'down' ); } },
            "sep1": "---------",
            "delete": { name: "Delete", callback: function( key, options ) { deleteLink( options.$trigger[0].id ); } }
        }
    });

    $.contextMenu({
        selector: '.main > h1',
        items: {
            "sup": { name: "Move Section Up", callback: function( key, options ) { moveSection( options.$trigger[0].parentNode, 'up' ); } },
            "sdown": { name: "Move Section Down", callback: function( key, options ) { moveSection( options.$trigger[0].parentNode, 'down' ); } },
            "ssep": "---------",
            "sdelete": { name: "Delete Section", callback: function( key, options ) { deleteSection( options.$trigger[0].parentNode.id ); } }
        }
    });
}

function Section( label, links, state )
{
    this.label = label;
    this.links = links;
    this.state = state;
    
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
            this.state = '';
        }

        if ( this.links.length )
        {
            for ( var i = 0; i < this.links.length; i++ )
            {
                this.links[i] = new Link( this.links[i]['href'], this.links[i]['label'], this.links[i]['imgSource'] );
                this.links[i].init( this.id, i );
            }
        }

        if ( this.state == 'hidden' ) {
            ToggleDisplay( document.getElementById( this.id ) );
        }
    }

    this.addLink = function ( link )
    {
        var newLinkId = this.links.length;
        this.links[newLinkId] = link;
        this.links[newLinkId].init( this.id, newLinkId );
    }

    // Returns 'true' if the section is 'empty' (no links in it) and the DOM elements for it were deleted;
    // otherwise, false
    this.deleteIfEmpty = function() {
        var foundLink = false;
        for ( var i = 0; i < this.links.length; i++ ) {
            if ( this.links[i] != 'deleted' ) {
                foundLink = true;
                break;
            }
        }

        if ( foundLink ) {
            return false;
        }
        else {
            this.deleteDomElements();
            return true;
        }
    }

    this.deleteDomElements = function() {
        if ( this.label != '#BLANK#' ) {
            var sectionToggler = document.getElementById( this.label );
            sectionToggler.parentNode.removeChild( sectionToggler );
        }

        var section = document.getElementById( this.id );
        section.parentNode.removeChild( section );
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
        this.id = sectionId.toString() + '-' + linkId.toString();

        var newSection = document.createElement( 'section' );
        newSection.id = this.id;

        var newLink = document.createElement( 'a' );
        newLink.href = this.href;
        newLink.title = this.label;
        
        var newDiv = document.createElement( 'div' );

        var newImg = document.createElement( 'img' );
        newImg.src = this.imgSource;

        if (this.label.trim() == '')
        {
            newImg.className = "full";
        }

        var newLabel = document.createElement( 'p' );
        newLabel.innerHTML = this.label;

        newDiv.appendChild( newImg );
        newDiv.appendChild( newLabel );
        newLink.appendChild( newDiv );
        newSection.appendChild( newLink );
        document.getElementById( sectionId ).appendChild( newSection );
    }

    this.delete = function() {
        var link = document.getElementById( this.id );
        link.parentNode.removeChild( link );
    }
}


function isInt( value ) {
    if( typeof value === 'number' && ( value % 1 ) === 0 ) {
        return true;
    }
    else {
        return false;
    }
}


function ToggleDisplay( obj )
{
    // if the item we're toggling is a section, we need to set the section object's state so it will be saved between browser sessions
    var setItemState = false;
    var sectionIndex = obj.id.split( '-' )[0] * 1;

    if ( isInt( sectionIndex ) ) {
        setItemState = true;
    }

    if( obj.style.fontSize == "0%" ) {
        obj.style.fontSize = obj.oldSize;

        if ( setItemState ) {
            pageSections[sectionIndex]['state'] = 'shown';
        }
    }
    else {
        obj.oldSize = obj.style.fontSize;
        obj.style.fontSize = "0%";

        if ( setItemState ) {
            pageSections[sectionIndex]['state'] = 'hidden';
        }
    }

    return true;
}


function showAddDialogue()
{
    document.getElementById( 'inputUrl' ).value   = '';
    document.getElementById( 'inputLabel' ).value = '';
    document.getElementById( 'inputImg' ).value   = '';

    origSection = document.getElementById( 'inputSection' ).value;

    document.getElementById( 'addDialogue' ).classList.remove( 'hidden' );
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

        pageSections[i] = new Section( newLinkSection, newLink, 'shown' );
        pageSections[i].init( i );
    }

    document.getElementById( 'addDialogue' ).classList.add( 'hidden' );
}

function cancelAddLink()
{
    document.getElementById( 'addDialogue' ).classList.add( 'hidden' );
    document.getElementById( 'inputSection' ).value = origSection;
}


function showImportExportDialogue()
{
    document.getElementById( 'importExportText' ).value = JSON.stringify( getCleanPageSections(), null, 3 );
    document.getElementById( 'importExportDialogue' ).classList.remove( 'hidden' );
}

function importContent()
{
    importing = true;
    importText = document.getElementById( 'importExportText' ).value;
    location.reload( true );
}

function closeImportExport()
{
    document.getElementById( 'importExportDialogue' ).classList.add( 'hidden' );
}


function deleteLink( linkId )
{
    var sectionIndex = linkId.split( '-' )[0];
    var linkIndex    = linkId.split( '-' )[1];

    // Rather than actually deleting an indexed position in pageSections, just place a 'deleted'
    // string in the position that used to hold the reference to the now-deleted link (or section);
    // This prevents having to write a whole lot of messy code to update the IDs on all of the DOM
    // elements whose IDs are derived from their indexes in pageSections.  These types of placeholder
    // strings are cleaned out of pageSections before it is stored in localStorage when the page
    // unloads
    pageSections[sectionIndex].links[linkIndex].delete();
    pageSections[sectionIndex].links[linkIndex] = 'deleted';
    
    // Check to see if section is empty, and if so, delete it, too.
    var wasEmpty = pageSections[sectionIndex].deleteIfEmpty();

    if ( wasEmpty ) {
        pageSections[sectionIndex] = 'deleted';
    }
}

function moveLink( linkNode, direction )
{
    if ( direction == 'up') {
        // Don't allow an 'up' move if the link is currently the first element in the
        // section, not including the label h1 tag
        if ( linkNode.previousSibling != null && linkNode.previousSibling.tagName != 'H1' ) {
            $( linkNode ).insertBefore( linkNode.previousSibling );
        }
    }
    else {
        // Don't allow a 'down' move if the link is currently the last element in the section
        if ( linkNode.nextSibling != null ) {
            $( linkNode ).insertAfter( linkNode.nextSibling );
        }
    }
}


function deleteSection( sectionId )
{
    pageSections[sectionId].deleteDomElements();
    pageSections[sectionId] = 'deleted';
}

function moveSection( sectionNode, direction )
{
    if ( direction == 'up') {
        // Don't allow an 'up' move if the section is currently the first element in the
        // group of sections, not including the label-less section (if it exists)
        if ( sectionNode.previousSibling != null && pageSections[sectionNode.previousSibling.id].label != '#BLANK#' ) {
            $( sectionNode ).insertBefore( sectionNode.previousSibling );
        }
    }
    else {
        // Don't allow a 'down' move if the link is currently the last element in the section
        if ( sectionNode.nextSibling != null ) {
            $( sectionNode ).insertAfter( sectionNode.nextSibling );
        }
    }
}


function getCleanPageSections()
{
    // Return a "clean" version of pageSections for localStorage or for export by rebuilding
    // the usual contents of pageSections starting from the DOM:
    //  - placeholder strings for deleted links or sections removed
    //  - sections and links listed in the order they appear on the page
    //  - IDs of sections and links nulled out
    var cleanVersion = [];

    var sections = $('div.main');
    
    for ( var i = 0; i < sections.length; i++ ) {
        for ( var j = 0; j < sections[i].childNodes.length; j++ ) {
            var thisNode = sections[i].childNodes[j];

            // If this is the first child-node of the section, then we need to derive the section label
            // and instantiate a new Section object for it
            if ( j == 0 ) {
                // Account for the fact that the user could have the label-less section at the top of the page
                if ( thisNode.tagName == 'H1' ) {
                    var nextNode = thisNode.nextSibling;
                    var sectionIndex = nextNode.id.split( '-' )[0];
                    cleanVersion[i] = new Section( thisNode.innerHTML, [], pageSections[sectionIndex]['state'] );
                }
                else {
                    cleanVersion[i] = new Section( '#BLANK#', [], '' );
                }
            }

            if ( thisNode.tagName == 'SECTION' ) {
                var sectionIndex = thisNode.id.split( '-' )[0];
                var linkIndex    = thisNode.id.split( '-' )[1];

                var linkObject = pageSections[sectionIndex].links[linkIndex];

                var href      = linkObject.href;
                var label     = linkObject.label;
                var imgSource = linkObject.imgSource;

                var link = new Link( href, label, imgSource );

                var newLinkIndex = cleanVersion[i].links.length;
                cleanVersion[i].links[newLinkIndex] = link;
            }
        }
    }
    
    return cleanVersion;
}

function savePageState()
{
    var saveData = '';

    if ( importing ) {
        saveData = importText;
        localStorage.setItem( 'savedLinks', saveData );

        backupData = JSON.stringify( getCleanPageSections() );
        localStorage.setItem( 'backedUpLinks', backupData );
    }
    else {
        if ( pageSections.length > 0 )
        {
            saveData = JSON.stringify( getCleanPageSections() );
            localStorage.setItem( 'savedLinks', saveData );
        }
        else
        {
            localStorage.removeItem( 'savedLinks' );
        }
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
    var stringo = JSON.stringify( pageSections );
    alert( stringo );
    stringo = JSON.stringify( getCleanPageSections() );
    alert( stringo );
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
