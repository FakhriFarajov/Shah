using ShahBuyerFeaturesApi.Core.Models;

namespace ShahBuyerFeaturesApi.Application.Utils
{
    public static class CategoryUtils
    {
        public static List<string> GetCategoryChain(Category? category)
        {
            var chain = new List<string>();
            while (category != null)
            {
                chain.Add(category.CategoryName);
                category = category.ParentCategory;
            }
            chain.Reverse(); // Now order is: RootCategory -> ... -> SubCategory -> ProductCategory
            return chain;
        }
    }
}
