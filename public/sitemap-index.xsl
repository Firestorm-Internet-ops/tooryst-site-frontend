<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>XML Sitemap Index - Storyboard</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
          }

          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 1rem;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .header h1 {
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 0.5rem;
          }

          .header p {
            opacity: 0.9;
            font-size: 1.1rem;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          .description {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            border-left: 4px solid #667eea;
          }

          .description h2 {
            color: #1a202c;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }

          .description p {
            color: #4a5568;
            margin-bottom: 1rem;
          }

          .description a {
            color: #667eea;
            text-decoration: none;
          }

          .description a:hover {
            text-decoration: underline;
          }

          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
          }

          .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            display: block;
          }

          .stat-label {
            color: #64748b;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .sitemap-table {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
          }

          .table-header {
            background: #f8fafc;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .table-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a202c;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            background: #f8fafc;
            padding: 1rem 1.5rem;
            text-align: left;
            font-weight: 600;
            color: #4a5568;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
          }

          td {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
          }

          tr:hover {
            background: #f7fafc;
          }

          .sitemap-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
          }

          .sitemap-link:hover {
            text-decoration: underline;
          }

          .sitemap-type {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
          }

          .type-static {
            background: #ddd6fe;
            color: #5b21b6;
          }

          .type-cities {
            background: #fef3c7;
            color: #92400e;
          }

          .type-attractions {
            background: #fecaca;
            color: #991b1b;
          }

          .lastmod {
            color: #64748b;
            font-size: 0.875rem;
          }

          .footer {
            text-align: center;
            margin-top: 2rem;
            padding: 1rem;
            color: #64748b;
            font-size: 0.875rem;
          }

          @media (max-width: 768px) {
            .header h1 {
              font-size: 2rem;
            }

            th, td {
              padding: 0.75rem 1rem;
              font-size: 0.875rem;
            }

            .container {
              padding: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>XML Sitemap Index</h1>
          <p>This sitemap index contains all sitemaps for Storyboard</p>
        </div>

        <div class="container">
          <div class="description">
            <h2>What is an XML Sitemap?</h2>
            <p>This XML Sitemap Index is generated by Storyboard. It is what search engines like Google use to crawl and re-crawl posts/pages/products/images/archives on your website.</p>
            <p><a href="https://developers.google.com/search/docs/advanced/sitemaps/overview" target="_blank" rel="noopener">Learn more about XML Sitemaps</a>.</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <span class="stat-number"><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/></span>
              <span class="stat-label">Total Sitemaps</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">
                <xsl:choose>
                  <xsl:when test="sitemap:sitemapindex/sitemap:sitemap/sitemap:lastmod">
                    <xsl:value-of select="substring(sitemap:sitemapindex/sitemap:sitemap[1]/sitemap:lastmod, 1, 10)"/>
                  </xsl:when>
                  <xsl:otherwise>Today</xsl:otherwise>
                </xsl:choose>
              </span>
              <span class="stat-label">Last Updated</span>
            </div>
          </div>

          <div class="sitemap-table">
            <div class="table-header">
              <h2 class="table-title">Available Sitemaps</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Sitemap</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td>
                      <xsl:choose>
                        <xsl:when test="contains(sitemap:loc, 'static')">
                          <div class="sitemap-type type-static">Static Pages</div>
                          <a href="/sitemap.xml" class="sitemap-link">
                            View Static Pages Sitemap
                          </a>
                        </xsl:when>
                        <xsl:when test="contains(sitemap:loc, 'cities')">
                          <div class="sitemap-type type-cities">Cities</div>
                          <a href="/api/v1/sitemap-cities.xml" class="sitemap-link">
                            View Cities Sitemap
                          </a>
                        </xsl:when>
                        <xsl:when test="contains(sitemap:loc, 'attractions')">
                          <div class="sitemap-type type-attractions">Attractions</div>
                          <a href="/api/v1/sitemap-attractions.xml" class="sitemap-link">
                            View Attractions Sitemap
                          </a>
                        </xsl:when>
                      </xsl:choose>
                    </td>
                    <td class="lastmod">
                      <xsl:value-of select="substring(sitemap:lastmod, 1, 19)"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <div class="footer">
            Generated by Storyboard
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>