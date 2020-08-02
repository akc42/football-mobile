# Introduction

I want this the overall application to be themed relatively easily.  It is
possible to understand what the main components of a theme are for the entire
application and define a set of colors in the database table which define each
component of the them.

Since this is a common type of requirement there is some css facilities to
support this, namely the CSS `::part` selector and then the ability to allow an
external entity to specify some css for a particular part.  This would probably
work well in a few interesting cases and now seems to have support across all
major platforms.  However there are two important extensions to this idea that
are really needed to use the concept through out.  This is the `::theme`
selector and the `exportparts` attribute.  However as far as I can see these are
not supported across all browsers, so whilst ultimately we should be using them,
in the short term it is not possible.

# Key elements we want to theme

The parts of the system that we want to theme are as follows:-

- Main background of all pages along with the shadow colour when against this background
- The colour of the header and footer background
- the colour of the elements on the footer and header 
- the colour of the bars on the menu button
- the colour of the header part of a page
- the colour of the text on the header part of a page
- the colour of the top panel (below the  header) on each page, its border, its internal grid lines and its background and its text.
- the colour of the cards under the top panel with the same emphasis on grid lines, (and borders ?)
- the colour of a comment 
- forms with input - particularly form background, fieldset lines, text borders on inputs, backgrounds on input contents, 

# Defining a theme

It is worth noting that there is a `@media` query that allows the theme
preference ('light' or 'dark') to be selected according to user preference.
Initially we will NOT be supporting this.  This is something for a later
release.

So for now we will only be defining a single theme.  There is a database table called styles and it has the values in it for css variables that can be used to define a scheme.

The following variables will be used

- --background-color Main page background
- --color Foreground Colour
- --shadow-color Colour of Panels
- --

This NEEDS MORE WORK.  I have a scheme not based on this, but I will move over to it once this is more fully defined