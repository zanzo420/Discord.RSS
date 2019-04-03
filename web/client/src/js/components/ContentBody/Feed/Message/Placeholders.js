import React from 'react'
import { Divider, Loader, Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'
import colors from '../../../../constants/colors'
import Wrapper from '../../../utils/Wrapper'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import parser from '../../../utils/textParser'
import modal from '../../../utils/modal'
import SectionSubtitleDescription from '../../../utils/SectionSubtitleDescription'
import posed from 'react-pose';
import SectionSubtitle from '../../../utils/SectionSubtitle'
import { Scrollbars } from 'react-custom-scrollbars';

const mapStateToProps = state => {
  return {
    feedId: state.feedId,
    articleList: state.articleList,
    articlesError: state.articlesError,
    articlesFetching: state.articlesFetching
  }
}

// const PlaceholdersContainer = styled.div`
//   scrollbar-width: thin;
//   color: ${colors.discord.text};
//   height: 350px;
//   min-height: 350px;
//   resize: vertical;
//   overflow: auto;
//   background-color: rgba(32, 34, 37, 0.6);
//   border-color: #202225;
//   border-style: solid;
//   border-width: 1px;
//   border-radius: 5px;
//   padding-top: 1em;
//   padding-bottom: 1em;
//   padding-left: 1em;
//   padding-right: 1em;
//   width: 100%;
//   p {
//     word-break: break-word;
//   }
// `

const ArticleBox = styled.div`
  margin-bottom: 1.5em;
  .ui.dropdown:first-child {
    margin-bottom: 1em;
  }
`

const PlaceholdersContainerStyles = styled(Wrapper)`
  ${props => props.small
    ? `display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;`
    : ''}
  scrollbar-width: thin;
  color: ${colors.discord.text};
  resize: vertical;
  /* overflow: auto; */
  /* background-color: rgba(32, 34, 37, 0.6); */
  padding: 0;
  border-color: #202225;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  width: 100%;
  p {
    word-break: break-word;
  }
`

const PlaceholdersContainerInner = styled.div`
  padding-top: 1em;
  padding-bottom: 1em;
  padding-left: 1em;
  padding-right: 1em;
`

const PlaceholdersContainer = posed(PlaceholdersContainerStyles)({
  small: { minHeight: 150, height: 150 },
  big: { minHeight: 350, height: 350 }
})

const PlaceholderImage = styled.div`
  > div {
    img {
      cursor: pointer;
      display: block;
      width: 100%;
      height: auto;
      margin-top: 1em;
    }
    @media only screen and (min-width: 450px) {
      display: flex;
      justify-content: space-between;
      img {
        margin-top: 0;
        padding-left: 1em;
      }
    }
  }
`

const PlaceholderNameContainer = styled.div`
  display: flex;
  margin-bottom: 0.5em;
  > p {
    margin-right: 1em;
    font-family: monospace;
    font-weight: bold;
    margin-bottom: 0;
  }
`

const RegexTag = styled.span`
  display: inline-block;
  background-color: ${colors.discord.greyple};
  padding: 1px 2px;
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 0.7em;
  color: black;
`

class Placeholders extends React.Component {
  constructor () {
    super()
    this.state = {
      articleId: 0,
      showArticleBy: ''
    }
  }

  setArticleId = articleId => {
    this.setState({ articleId })
    this.props.updateArticleId(articleId)
  }

  render () {
    const { articleList, articlesError, articlesFetching } = this.props
    const placeholderElements = []
    const article = articleList[this.state.articleId]

    // Show Article By
    let showArticleBy = this.state.showArticleBy
    const seenPlaceholders = {}
    for (const article of articleList) {
      for (const placeholder in article) {
        if (placeholder.startsWith('regex:') || placeholder === 'fullDescription' || placeholder === 'fullSummary' || placeholder === 'fullTitle' || placeholder.startsWith('raw:')) continue
        if (article[placeholder]) seenPlaceholders[placeholder] = true
      }
    }

    const showArticleByOptions = Object.keys(seenPlaceholders).map(placeholder => {
      if (!showArticleBy && placeholder === 'title') showArticleBy = placeholder
      return { text: placeholder, value: placeholder }
    })
    if (!showArticleBy && showArticleByOptions.length > 0) showArticleBy = showArticleByOptions[0].value

    // Articles
    const articleDropdownOptions = articleList.map((placeholders, index) => {
      return { text: placeholders[showArticleBy], value: index }
    })

    // List of placeholders
    if (article) {
      for (const placeholderName in article) {
        const content = article[placeholderName]
        if (!content || placeholderName === 'fullTitle' || placeholderName === 'fullDescription' || placeholderName === 'fullSummary' || placeholderName.startsWith('raw:')) continue
        const phname = placeholderName.replace('regex:', '') // The {regex: in the beginning is for internal reference only
        placeholderElements.push(
          <PlaceholderImage key={`article.${placeholderName}`}>
            <div>
              <div>
                <PlaceholderNameContainer>
                  <p className='preview-placeholder-name'>{`{${phname}}`}</p>
                  { placeholderName.startsWith('regex') ? <RegexTag>Regex</RegexTag> : null }
                </PlaceholderNameContainer>
                {/* { phname === 'link' || phname.includes('image') || phname.includes('anchor')
                  ? <a href={content} target='_blank' rel='noopener noreferrer'><p>{content}</p></a>
                  :  */}
                  <p>{parser.parse(content)}</p>
                {/* } */}
              </div>
              { phname.includes('image') ? <div><img onClick={e => modal.showImage(content, phname)} alt={phname} src={content} /></div> : null }
            </div>
            <Divider />
          </PlaceholderImage>
        )
      }
    }

    const disabledDropdown = !!(articlesFetching || !!articlesError)

    return (
      <div>
        <SectionSubtitle>Article</SectionSubtitle>
        <ArticleBox>
          <Dropdown selection fluid options={showArticleByOptions} value={showArticleBy} onChange={(e, data) => this.setState({ showArticleBy: data.value })} disabled={disabledDropdown} loading={articlesFetching} />
          <Dropdown search selection fluid options={articleDropdownOptions} value={this.state.articleId} onChange={(e, data) => this.setArticleId(data.value)} disabled={disabledDropdown} loading={articlesFetching} />
        </ArticleBox>
        <SectionSubtitle>Placeholders</SectionSubtitle>
        

        <PlaceholdersContainer pose={articlesFetching || articlesError ? 'small' : 'big'} small={articlesFetching || articlesError}>
        <Scrollbars>
          <PlaceholdersContainerInner>
          {articlesFetching
            ? <Loader inverted size='big' active />
            : articlesError
              ? <div>
                <SectionSubtitleDescription style={{ color: colors.discord.red }}>Failed to Load Articles</SectionSubtitleDescription>
                <SectionSubtitleDescription>{articlesError || 'Unknwon Error'}</SectionSubtitleDescription>
              </div>
              : placeholderElements}
              </PlaceholdersContainerInner>
        </Scrollbars>
        </PlaceholdersContainer>

      </div>
    )
  }
}

Placeholders.propTypes = {
  articleList: PropTypes.array,
  articlesError: PropTypes.string,
  articlesFetching: PropTypes.bool
}

export default connect(mapStateToProps)(Placeholders)
