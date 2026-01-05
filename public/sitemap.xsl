<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - Storyboard</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; background-color: #f8fafc; color: #1e293b; }
          .header { background: linear-gradient(to right, #6366f1, #a855f7); padding: 40px 20px; text-align: center; color: white; }
          .container { max-width: 1000px; margin: -40px auto 40px; padding: 0 20px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
          .card h2 { margin: 0; color: #6366f1; font-size: 32px; }
          .card p { margin: 5px 0 0; color: #64748b; text-transform: uppercase; font-size: 12px; font-weight: bold; }
          .table-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); overflow: hidden; }
          .table-header { padding: 20px; border-bottom: 1px solid #f1f5f9; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 15px 20px; background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; }
          td { padding: 15px 20px; border-top: 1px solid #f1f5f9; font-size: 14px; word-break: break-all; }
          a { color: #6366f1; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>XML Sitemap</h1>
          <p>This sitemap contains the URLs for Storyboard</p>
        </div>
        <div class="container">
          <div class="stats-grid">
            <div class="card">
              <h2>
                <xsl:choose>
                  <xsl:when test="sitemap:sitemapindex">
                    <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
                  </xsl:otherwise>
                </xsl:choose>
              </h2>
              <p>Total URLs</p>
            </div>
            <div class="card">
              <h2>
                <xsl:choose>
                  <xsl:when test="sitemap:sitemapindex">
                    <xsl:value-of select="sitemap:sitemapindex/sitemap:sitemap[1]/sitemap:lastmod"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="sitemap:urlset/sitemap:url[1]/sitemap:lastmod"/>
                  </xsl:otherwise>
                </xsl:choose>
              </h2>
              <p>Last Updated</p>
            </div>
          </div>

          <div class="table-card">
            <div class="table-header">Sitemap Content</div>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th style="width: 200px;">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
                
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>