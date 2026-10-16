export default function CampaignInfoCard({
  form, setField, brands, categoryGroups, onSearchBrand
}) {
  return (
    <section className="card">
      <details className="section-details">
        <summary className="card-title section-summary">
          <div><span className="step">2</span><b>ข้อมูลกิจกรรม</b></div>
        </summary>

        <div className="grid two">
          <label>ชื่อกิจกรรม
            <input id="title" placeholder="เช่น EP. ตามด้วยชื่อ" value={form.title} onChange={e => setField("title", e.target.value)} />
          </label>
          <label>SEO Slug
            <input id="slug" placeholder="brandName-{{timestamp}}" value={form.slug} onChange={e => setField("slug", e.target.value)} />
          </label>

          <label>Brand
            <div className="input-action">
              <input
                id="brandSearch" placeholder="พิมพ์ชื่อ Brand แล้วกดค้นหา"
                value={form.brandSearch} onChange={e => setField("brandSearch", e.target.value)}
              />
              <button id="searchBrandBtn" className="secondary" onClick={onSearchBrand}>ค้นหา</button>
            </div>
            <select id="brandSelect" value={form.brandId} onChange={e => setField("brandId", e.target.value)}>
              <option value="">-- เลือก Brand --</option>
              {brands.map(x => <option key={x.id} value={String(x.id)}>{x.name}</option>)}
            </select>
          </label>

          <label>Category
            <select id="categorySelect" value={form.categoryId} onChange={e => setField("categoryId", e.target.value)}>
              <option value="">-- เลือก Category --</option>
              {categoryGroups.map(group => {
                const children = group.children || [];
                if (!children.length) {
                  return <option key={group.id} value={String(group.id)}>{group.name}</option>;
                }
                return (
                  <optgroup key={group.id} label={group.name}>
                    <option value={String(group.id)}>{group.name}</option>
                    {children.map(child => (
                      <option key={child.id} value={String(child.id)}>{child.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>

          <label>Cover Image URL
            <input id="coverImage" placeholder="https://img.salehere.co.th/..." value={form.coverImage} onChange={e => setField("coverImage", e.target.value)} />
          </label>
          <div className="grid two">
            <label>Social Gencode
              <select id="genCodeSocialType" value={form.genCodeSocialType} onChange={e => setField("genCodeSocialType", e.target.value)}>
                <option value="">ไม่มี</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </label>
          </div>
        </div>
      </details>
    </section>
  );
}
