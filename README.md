sticky-headers
==============

An AngularJS directive for making headers that won't scroll past the top of the screen.

[Demo Page](http://rawgit.com/FutureStateMobile/sticky-header/master/demo/index.html)

<img src='https://cloud.githubusercontent.com/assets/353374/4542675/5f7336f8-4e24-11e4-8ecd-1749a5639ca1.png' />

<img src='https://cloud.githubusercontent.com/assets/353374/4542679/68567294-4e24-11e4-8c4d-4f0e3227743f.png' />

How to use it
-------------

Just include jquery, angular, and the sticky-headers javascript file in your page, or install via bower

```
bower install fsm-sticky-header
```

```html
  <head>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-rc.2/angular.min.js"></script>
	<script src="https://rawgithub.com/FutureStateMobile/sticky-headers/master/src/fsm-sticky-header.js"></script>
  </head>
```
Then add the directive to the element that you with to stick to the top of the page

```html
  <table id="testtable" >
    <thead>
      <tr fsm-sticky-header scroll-body="'#testtable'" scroll-stop='50'>
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
