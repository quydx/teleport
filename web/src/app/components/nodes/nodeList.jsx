var React = require('react');
var reactor = require('app/reactor');
var {getters, actions} = require('app/modules/nodes');
var userGetters = require('app/modules/user/getters');
var {Table, Column, Cell, SortHeaderCell, SortTypes} = require('app/components/table.jsx');
var {createNewSession} = require('app/modules/activeTerminal/actions');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var _ = require('_');
var {isMatch} = require('app/common/objectUtils');

const TextCell = ({rowIndex, data, columnKey, ...props}) => (
  <Cell {...props}>
    {data[rowIndex][columnKey]}
  </Cell>
);

const TagCell = ({rowIndex, data, columnKey, ...props}) => (
  <Cell {...props}>
    { data[rowIndex].tags.map((item, index) =>
      (<span key={index} className="label label-default">
        {item.role} <li className="fa fa-long-arrow-right"></li>
        {item.value}
      </span>)
    ) }
  </Cell>
);

const LoginCell = ({logins, onLoginClick, rowIndex, data, ...props}) => {
  if(!logins ||logins.length === 0){
    return <Cell {...props} />;
  }

  var serverId = data[rowIndex].id;
  var $lis = [];

  function onClick(i){
    var login = logins[i];
    if(onLoginClick){
      return ()=> onLoginClick(serverId, login);
    }else{
      return () => createNewSession(serverId, login);
    }
  }

  for(var i = 0; i < logins.length; i++){
    $lis.push(<li key={i}><a onClick={onClick(i)}>{logins[i]}</a></li>);
  }

  return (
    <Cell {...props}>
      <div className="btn-group">
        <button type="button" onClick={onClick(0)} className="btn btn-xs btn-primary">{logins[0]}</button>
        {
          $lis.length > 1 ? (
              [
                <button key={0} data-toggle="dropdown" className="btn btn-default btn-xs dropdown-toggle" aria-expanded="true">
                  <span className="caret"></span>
                </button>,
                <ul key={1} className="dropdown-menu">
                  {$lis}
                </ul>
              ] )
            : null
        }
      </div>
    </Cell>
  )
};

var NodeList = React.createClass({

  mixins: [LinkedStateMixin],

  getInitialState(props){
    this.searchableProps = ['sessionCount', 'addr'];
    return { filter: '', colSortDirs: {} };
  },

  onSortChange(columnKey, sortDir) {
    this.setState({
      ...this.state,
      colSortDirs: {
        [columnKey]: sortDir
      }
    });
  },

  sortAndFilter(data){
    var filtered = data.filter(obj=>
      isMatch(obj, this.state.filter, { searchableProps: this.searchableProps}));

    var columnKey = Object.getOwnPropertyNames(this.state.colSortDirs)[0];
    var sortDir = this.state.colSortDirs[columnKey];
    var sorted = _.sortBy(filtered, columnKey);
    if(sortDir === SortTypes.ASC){
      sorted = sorted.reverse();
    }

    return sorted;
  },

  render: function() {
    var data = this.sortAndFilter(this.props.nodeRecords);
    var logins = this.props.logins;
    var onLoginClick = this.props.onLoginClick;

    return (
      <div className="grv-nodes">
        <h1> Nodes </h1>
        <div className="grv-search">
          <input valueLink={this.linkState('filter')} placeholder="Search..." className="form-control"/>
        </div>
        <div className="">
          <Table rowCount={data.length} className="table-striped grv-nodes-table">
            <Column
              columnKey="sessionCount"
              header={
                <SortHeaderCell
                  sortDir={this.state.colSortDirs.sessionCount}
                  onSortChange={this.onSortChange}
                  title="Sessions"
                />
              }
              cell={<TextCell data={data}/> }
            />
            <Column
              columnKey="addr"
              header={
                <SortHeaderCell
                  sortDir={this.state.colSortDirs.addr}
                  onSortChange={this.onSortChange}
                  title="Node"
                />
              }

              cell={<TextCell data={data}/> }
            />
            <Column
              columnKey="tags"
              header={<Cell></Cell> }
              cell={<TagCell data={data}/> }
            />
            <Column
              columnKey="roles"
              onLoginClick={onLoginClick}
              header={<Cell>Login as</Cell> }
              cell={<LoginCell data={data} logins={logins}/> }
            />
          </Table>
        </div>
      </div>
    )
  }
});

module.exports = NodeList;