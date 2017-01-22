import * as React from 'react'
import {
  isType,
} from 'graphql'
import * as cx from 'classnames'

import FieldDoc from 'graphiql/dist/components/DocExplorer/FieldDoc'
import SchemaDoc from './DocExplorer/SchemaDoc'
import SearchBox from './DocExplorer/SearchBox'
import SearchResults from 'graphiql/dist/components/DocExplorer/SearchResults'
import TypeDoc from 'graphiql/dist/components/DocExplorer/TypeDoc'
// import {$v} from 'graphcool-styles'

/**
 * DocExplorer
 *
 * Shows documentations for GraphQL definitions from the schema.
 *
 * Props:
 *
 *   - schema: A required GraphQLSchema instance that provides GraphQL document
 *     definitions.
 *
 * Children:
 *
 *   - Any provided children will be positioned in the right-hand-side of the
 *     top bar. Typically this will be a 'close' button for temporary explorer.
 *
 */

interface Props {
  schema: any
  open: boolean
}

interface State {
  navStack: any[]
  searchValue: any
}

export class DocExplorer extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {navStack: [], searchValue: undefined} as State
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.schema !== nextProps.schema ||
      this.state.navStack !== nextState.navStack ||
      this.state.searchValue !== nextState.searchValue
    )
  }

  render() {
    const schema = this.props.schema
    const navStack = this.state.navStack

    let navItem
    if (navStack.length > 0) {
      navItem = navStack[navStack.length - 1]
    }

    let title = 'Documentation Explorer'
    let content
    if (schema === undefined) {
      // Schema is undefined when it is being loaded via introspection.
      content =
        <div className='spinner-container'>
          <div className='spinner'/>
        </div>
    } else if (schema === null) {
      // Schema is null when it explicitly does not exist, typically due to
      // an error during introspection.
      content =
        <div className='error-container'>
          {'No Schema Available'}
        </div>
    } else if (navItem) {
      if (navItem.name === 'Search Results') {
        title = navItem.name
        content =
          <SearchResults
            searchValue={navItem.searchValue}
            schema={schema}
            onClickType={this.handleClickTypeOrField}
            onClickField={this.handleClickTypeOrField}
          />
      } else {
        title = navItem.name
        if (isType(navItem)) {
          content =
            <TypeDoc
              key={navItem.name}
              schema={schema}
              type={navItem}
              onClickType={this.handleClickTypeOrField}
              onClickField={this.handleClickTypeOrField}
            />
        } else {
          content =
            <FieldDoc
              key={navItem.name}
              field={navItem}
              onClickType={this.handleClickTypeOrField}
            />
        }
      }
    } else if (schema) {
      content =
        <SchemaDoc schema={schema} onClickType={this.handleClickTypeOrField}/>
    }

    let prevName
    if (navStack.length === 1) {
      prevName = 'Schema'
    } else if (navStack.length > 1) {
      prevName = navStack[navStack.length - 2].name
    }

    const shouldSearchBoxAppear = content && (
        content.type === SearchResults || content.type === SchemaDoc
      )

    return (
      <div
        className={cx('doc-explorer', {
          'show-title': Boolean(prevName),
        })}
      >
        <style jsx={true}>{`
          .doc-explorer-contents {
            @inherit: .pa0;
            top: 0;
            box-shadow: none;
            border-left: 6px solid $green;
          }
          .doc-explorer-title-bar {
            z-index: 2;
          }
        `}</style>
        {
          prevName &&
          <div
            className={'doc-explorer-title-bar'}
          >
            <div
              className='doc-explorer-back'
              onClick={this.handleNavBackClick}>
              {prevName}
            </div>
            <div className='doc-explorer-title'>
              {title}
            </div>
          </div>
        }
        <div className='doc-explorer-contents'>
          <div className='header'>
            <SearchBox
              isShown={shouldSearchBoxAppear}
              onSearch={this.handleSearch}
            />
          </div>
          {content}
        </div>
      </div>
    )
  }

  // Public API
  showDoc(typeOrField) {
    let navStack = this.state.navStack
    const isCurrentlyShown =
      navStack.length > 0 && navStack[navStack.length - 1] === typeOrField
    if (!isCurrentlyShown) {
      navStack = navStack.concat([typeOrField])
    }

    this.setState({navStack} as State)
  }

  // Public API
  showSearch(searchItem) {
    let navStack = this.state.navStack
    const lastEntry = navStack.length > 0 && navStack[navStack.length - 1]
    if (!lastEntry) {
      navStack = navStack.concat([searchItem])
    } else if (lastEntry.searchValue !== searchItem.searchValue) {
      navStack = navStack.slice(0, -1).concat([searchItem])
    }

    this.setState({navStack} as State)
  }

  handleNavBackClick = () => {
    this.setState({navStack: this.state.navStack.slice(0, -1)} as State)
  }

  handleClickTypeOrField = typeOrField => {
    this.showDoc(typeOrField)
  }

  handleSearch = value => {
    this.showSearch({
      name: 'Search Results',
      searchValue: value,
    })
  }
}
