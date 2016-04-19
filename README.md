sticky-headers
==============

An AngularJS directive for making headers that won't scroll past the top of the screen.

[Demo Page](http://rawgit.com/FutureStateMobile/sticky-header/master/demo/index.html)

<img src='https://cloud.githubusercontent.com/assets/353374/4542675/5f7336f8-4e24-11e4-8ecd-1749a5639ca1.png' />

<img src='https://cloud.githubusercontent.com/assets/353374/4542679/68567294-4e24-11e4-8c4d-4f0e3227743f.png' />

How to use it
-------------

Just include jQuery, Angular, and the sticky-headers JavaScript file in your page. You can also install it
using either `bower` or `npm`:

```
bower install fsm-sticky-header

# or

npm install fsm-sticky-header
```

```html
  <head>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.6/angular.min.js"></script>
	<script src="https://rawgithub.com/FutureStateMobile/sticky-headers/master/src/fsm-sticky-header.js"></script>
  </head>
```

Then include the `fsm` Angular module in your own module:

```js
angular.module('MyHappyModule', ['fsm']);
```

Then add the directive to the element that you with to stick to the top of the page

```html
  <table ng-app="MyHappyModule" id="testtable">
    <thead>
      <tr fsm-sticky-header scroll-body="#testtable" scroll-stop='50'>
         <th>Column One Header</th>
         <th>Column Two Header</th>
      </tr>
    </thead>
    <tbody>
      <tr>
         <td>table1 data1</td>
         <td>table1 data1</td>
      </tr>
      <tr>
         <td>table1 data2</td>
         <td>table1 data2</td>
      </tr>
      ...
    </tbody>
  </table>
```

Options
--------

* scroll-body
   * this is the JQuery selector of the element that your header is bound to.  Sticky header will follow the position of that element and keep the header on top of that element as it scrolls off the page.
* scroll-stop
   * this is how many pixels from the top of the page your elment will stop scrolling at, just in case you have a header on the top of your page.
* scrollable-container
   * If you have a scrollable element such as a div, rather than the web page body scrolling, you'll need to specify that element id here.

Browser Support
--------

We support the current versions of Chrome, Firefox, Safari, Microsoft Edge and Internet Explorer 10+.