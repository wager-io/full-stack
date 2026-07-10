import React, { useState } from 'react';
import { IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { FaSearch } from 'react-icons/fa';
import { FaCompressAlt } from "react-icons/fa";
import { articles, categories } from './helpData';
import './styles/Help.css';

export default function Help({ onClose, isExpanded, setIsExpanded }) {
  const [navigationStack, setNavigationStack] = useState([
    { level: 'main', data: null }
  ]);

  const currentLevel = navigationStack[navigationStack.length - 1];

  const navigateTo = (level, data) => {
    setNavigationStack(prev => [...prev, { level, data }]);
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
      
      if (currentLevel.level === 'article') {
        setIsExpanded(false);
      }
    }
  };

  const handleCategoryClick = (category) => {
    navigateTo('category', category);
  };

  const handleSubcategoryClick = (subcategory) => {
    navigateTo('subcategory', subcategory);
  };

  const handleGroupClick = (group) => {
    navigateTo('group', group);
  };

  const handleArticleClick = (article) => {
    navigateTo('article', article);
    setIsExpanded(true);
  };

 
  const renderSection = (section, index) => {
    switch (section.type) {
      case 'text':
        return (
          <p key={index} className="article-text">
            {section.content}
          </p>
        );
      case 'heading':
        return (
          <h3 key={index} className="article-section-title">
            {section.content}
          </h3>
        );
      case 'list':
        return (
          <ul key={index} className="article-list">
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        );
      case 'warning':
        return (
          <p key={index} className="article-warning">
            <strong>{section.content}</strong>
          </p>
        );
      case 'button':
        return (
          <button key={index} className="article-action-btn">
            {section.text}
          </button>
        );
      default:
        return null;
    }
  };

  
  if (currentLevel.level === 'article') {
    const articleTitle = currentLevel.data;
    const articleData = articles[articleTitle] || articles['default'];
    
    return (
      <div className="help-box expanded">
        <div className="help-header article-header">
          <button className="back-btn" onClick={navigateBack}>
            <IoChevronBack />
          </button>
          <div className="header-actions">
            <button className="resize-btn" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Shrink modal" : "Expand modal"}>
              <FaCompressAlt />
            </button>
            <button className="close-btn" onClick={onClose}>
              <IoClose />
            </button>
          </div>
        </div>

        <div className="help-content">
          <div className="article-content">
            <h1 className="article-main-title">{articleData.title}</h1>
            <p className="article-updated">{articleData.updated}</p>
            
            <div className="table-of-contents">
              <span className="toc-title">Table of contents</span>
              <IoChevronForward className="toc-arrow" />
            </div>

            <div className="article-body">
              {articleData.content.sections.map((section, index) => 
                renderSection(section, index)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  if (currentLevel.level === 'group') {
    const group = currentLevel.data;
    return (
      <div className="help-box">
        <div className="help-header">
          <button className="back-btn" onClick={navigateBack}>
            <IoChevronBack />
          </button>
          <span>Help</span>
          <button className="close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="help-search">
          <input type="text" placeholder="Search for help" />
          <FaSearch className="search-icon" />
        </div>

        <div className="help-content">
          <div className="category-detail">
            <h3 className="category-title">{group.name}</h3>
            <p className="category-count">{group.articles} articles</p>
            
            <div className="articles-list">
              {group.items.map((article, index) => (
                <div 
                  key={index} 
                  className="article-item"
                  onClick={() => handleArticleClick(article)}
                >
                  <span className="article-title">{article}</span>
                  <IoChevronForward className="article-arrow" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  if (currentLevel.level === 'subcategory') {
    const subcategory = currentLevel.data;
    return (
      <div className="help-box">
        <div className="help-header">
          <button className="back-btn" onClick={navigateBack}>
            <IoChevronBack />
          </button>
          <span>Help</span>
          <button className="close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="help-search">
          <input type="text" placeholder="Search for help" />
          <FaSearch className="search-icon" />
        </div>

        <div className="help-content">
          <div className="category-detail">
            <h3 className="category-title">{subcategory.name}</h3>
            <p className="category-count">{subcategory.articles} articles</p>
            
            <div className="articles-list">
              {subcategory.groups ? (
                // For subcategories with groups (like Getting Started -> Verifying Your Account)
                subcategory.groups.map((group, index) => (
                  <div 
                    key={index} 
                    className="article-item"
                    onClick={() => handleGroupClick(group)}
                  >
                    <div className="category-info">
                      <div className="category-name">{group.name}</div>
                      <div className="category-articles">{group.articles} articles</div>
                    </div>
                    <IoChevronForward className="article-arrow" />
                  </div>
                ))
              ) : subcategory.type === 'subcategories' ? (
                // For nested subcategories (like Poker with its own subcategories)
                subcategory.items.map((nestedSubcategory, index) => (
                  <div 
                    key={index} 
                    className="article-item"
                    onClick={() => handleSubcategoryClick(nestedSubcategory)}
                  >
                    <div className="category-info">
                      <div className="category-name">{nestedSubcategory.name}</div>
                      <div className="category-articles">{nestedSubcategory.articles} articles</div>
                    </div>
                    <IoChevronForward className="article-arrow" />
                  </div>
                ))
              ) : (
                // For subcategories with direct items (like Account -> Managing Your Account)
                subcategory.items.map((article, index) => (
                  <div 
                    key={index} 
                    className="article-item"
                    onClick={() => handleArticleClick(article)}
                  >
                    <span className="article-title">{article}</span>
                    <IoChevronForward className="article-arrow" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render subcategories view (e.g., Verifying Your Account)
  if (currentLevel.level === 'category') {
    const category = currentLevel.data;
    return (
      <div className="help-box">
        <div className="help-header">
          <button className="back-btn" onClick={navigateBack}>
            <IoChevronBack />
          </button>
          <span>Help</span>
          <button className="close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="help-search">
          <input type="text" placeholder="Search for help" />
          <FaSearch className="search-icon" />
        </div>

        <div className="help-content">
          <div className="category-detail">
            <h3 className="category-title">{category.name}</h3>
            <p className="category-count">{category.articles} articles</p>
            
            <div className="articles-list">
              {category.type === 'subcategories' ? (
                category.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="article-item"
                    onClick={() => handleSubcategoryClick(item)}
                  >
                    <div className="category-info">
                      <div className="category-name">{item.name}</div>
                      <div className="category-articles">{item.articles} articles</div>
                    </div>
                    <IoChevronForward className="article-arrow" />
                  </div>
                ))
              ) : (
                category.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="article-item"
                    onClick={() => handleArticleClick(item)}
                  >
                    <span className="article-title">{item}</span>
                    <IoChevronForward className="article-arrow" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main categories view
  return (
    <div className="help-box">
      <div className="help-header">
        <span>Help</span>
        <button className="close-btn" onClick={onClose}>
          <IoClose />
        </button>
      </div>

      <div className="help-search">
        <input type="text" placeholder="Search for help" />
        <FaSearch className="search-icon" />
      </div>

      <div className="help-content">
        <h4>8 collections</h4>
        <div className="category-list">
          {categories.map((cat, index) => (
            <div 
              key={index} 
              className="category-item"
              onClick={() => handleCategoryClick(cat)}
            >
              <div className="category-info">
                <div className="category-name">{cat.name}</div>
                <div className="category-articles">{cat.articles} articles</div>
              </div>
              <IoChevronForward className="category-arrow" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
