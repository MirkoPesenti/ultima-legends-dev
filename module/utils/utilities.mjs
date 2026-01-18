// Utility function to generate a URL-friendly slug from a given input string.
export function slugify( input ) {

    const slug = String( input )
        .normalize( 'NFKD' )
        .replace( /[\u0300-\u036F]/g, '' )
        .toLowerCase()
        .replace( /[^a-z0-9]+/g, '-' )
        .replace( /\s+/g, '-' )
        .replace( /-+/g, '-' )
        .replace( /^-+/g, '' )
        .replace( /-+$/g, '' )
        .trim();

    console.debug( [input, slug] );
    return slug;

}

export async function enrichHTML( value, document ) {

    return await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        value ?? '',
        {
            secrets: document.isOwner,
            async: true,
            rollData: document.getRollData(),
            relativeTo: document,
        }
    );

}