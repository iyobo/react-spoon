import React from 'react/addons';
import ReactSpoon from '../lib/react-spoon.jsx';

describe('ReactSpoon', function() {
  var component;

  beforeEach(function() {
    component = React.addons.TestUtils.renderIntoDocument(
      <ReactSpoon/>
    );
  });

  it('should render', function() {
    expect(component.getDOMNode().className).toEqual('react-spoon');
  });
});
